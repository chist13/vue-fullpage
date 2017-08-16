<template lang="pug">
    div.fullpage__container(ref="container")
        div.fullpage__wrapper(
            :style="styles"
            :class="classes"
            ref="wrapper"
            @mousedown="onStart" @touchstart="onStart"
            @mouseup="onEnd" @touchend="onEnd"
        )
            slot
</template>

<script>
    export default {
        props: {
            start: {type: Number, default: 0},
            duration: {type: Number, default: 500},
            delay: {type: Number, default: 0},
            animation: {type: String},
            loop: {type: Boolean, default: false},
            dir: {type: String, default: 'v'},
            der: {type: Number, default: 0.05}
        },
        data() {
            return {
                inited: false,
                pages: false,
                total: false,
                height: 0,
                width: 0,
                moving: false,
                current: this.start,
                startX: false,
                startY: false
            }
        },
        mounted() {
            this._init(this.data)
            this.$emit('ready')
        },
        methods: {
            onStart(e) {
                if (this.moving) { return }

                const target = (e.type === 'touchstart')
                    ? e.targetTouches[0]
                    : e

                this.startX = target.pageX
                this.startY = target.pageY
            },
            onEnd(e) {
                if (this.moving) { return }

                const target = (e.type === 'touchend')
                    ? e.changedTouches[0]
                    : e

                const sub = (this.dir === 'v')
                    ? (target.pageY - this.startY) / this.height
                    : (target.pageX - this.startX) / this.width

                if (Math.abs(sub) > this.der) {
                    (sub < 0)
                        ? this.next()
                        : this.prev()
                }
            },
            moveTo(pageIndex, allowAnimation = true) {
                // abort if still moving
                if (this.moving === true) { return }

                // abort if current page and target page are the same
                if (this.currrent === pageIndex) { return }

                const nextIndex = this._resolveNextIndex(pageIndex)
                // abort if loop set to false and nextItem is outrange
                if (nextIndex === false) { return }

                const prev = this.current
                const next = nextIndex

                this.moving = true

                if (!allowAnimation) {
                    // instant move without triggering events
                    // must be using for initial page
                    this._endAnimation()
                    this._move(nextIndex)
                } else {
                    // regular move with events
                    this._startAnimation()
                    this.$emit('beforeChange', prev, next)

                    this._waitAnimation(function() {
                        this._endAnimation()
                        this._waitTransition(() => this.$emit('afterChange', prev, next))
                        this._move(nextIndex)
                    })
                }
            },
            next() {
                this.moveTo(this.current + 1)
            },
            prev() {
                this.moveTo(this.current - 1)
            },
            instantMoveTo(pageIndex) {
                this.moveTo(pageIndex, false)
            },
            _waitTransition(cb) {
                // check if where is transition
                if (!this.animation) {
                    return this._wait(cb, this.duration)
                }
                cb.call(this)
            },
            _waitAnimation(cb) {
                // check if where is animation
                if (this.animation) {
                    return this._waitDelay(cb, this.duration)
                }
                this._waitDelay(cb)
            },
            _waitDelay(cb, duration = 0) {
                this._wait(cb, this.delay + duration)
            },
            _wait(cb, time) {
                setTimeout(cb.bind(this), time)
            },
            _init() {
                this.height = this.$refs.container.offsetHeight
                this.width = this.$refs.container.offsetWidth

                this.pages = this.$slots.default.filter(e => e.tag)
                this.total = this.pages.length

                if (this.start != 0) {
                    this.instantMoveTo(this.start)
                }
            },
            _endAnimation() {
                if (this.animation) {
                    this.$refs.wrapper.classList.remove(this.animation)
                }
            },
            _startAnimation() {
                if (this.animation) {
                    this._waitDelay(() => {
                        this.$refs.wrapper.classList.add(this.animation)
                    })
                }
            },
            _move(pageIndex) {
                this.moving = false
                this.current = pageIndex
            },
            _resolveNextIndex(pageIndex) {
                if ((this.loop === false) && (pageIndex < 0 || (pageIndex >= this.total))) {
                    // if loop is false and index is outrange
                    return false
                }

                if (pageIndex < 0) {
                    return this.total - 1
                }
                if (pageIndex >= this.total) {
                    return 0
                }
                return pageIndex
            }
        },
        computed: {
            styles() {
                let x = 0, y = 0;

                (this.dir === 'v')
                    ? y = -this.height * this.current
                    : x = -this.width * this.current

                return {
                    '-webkit-transform': `translate3d(${x}px, ${y}px, 0px)`,
                    'transform': `translate3d(${x}px, ${y}px, 0px)`,
                    'transition': !this.animation ? `all ${this.duration}ms` : ``,
                }
            },
            classes() {
                return [this.dir !== 'v' ? 'fullpage__wrapper_horizontal' : '']
            }
        }
    }
</script>

<style lang="sass" scoped>
    .fullpage
        @at-root
            &__container
                position: relative
                width: 100vw
                height: 100vh
                overflow: hidden

            &__wrapper
                display: flex
                width: 100vw
                height: 100vh
                flex-flow: column nowrap
                justify-content: flex-start
                align-items: center

                &_horizontal
                    display: flex
                    flex-flow: row nowrap
                    justify-content: flex-start
                    align-items: center
</style>