;(function ($) {

  var root = this
  console.log(root)

  function Switcher (ele, opts) {
    this.opts       = opts || {}
    this.$ele       = $(ele)
    this.$items     = this.opts.$items || this.$ele.find('.container > .item')
    this.$controls  = this.opts.$controls || this.$ele.find('.controls')
    this.$indicator = this.opts.$indicator || this.$ele.find('.indicator')
    this.$active    = null
    this.interval   = null
    this.inAnimate  = false
    this.effect     = this.opts.effect || 'slide'
    this.klass      = this.getKlass()
  }

  Switcher.fn = Switcher.prototype = {
    init: function () {
      if (this.opts.interval) {
        this['interval:start']()
      }
      this['bind:event']()
    },
    'bind:event': function () {
      var that = this

      this.$controls.on('click', '[data-direction]', function () {
        that.animate($(this).data('direction'))
      })

      this.$indicator.on('click', '[data-index]', function () {
        that.to($(this).data('index'))
      })

      this.$ele.on({
        'mouseenter': function () {
          if (that.opts.interval) that['interval:stop']()
        },
        'mouseleave': function () {
          if (that.opts.interval) that['interval:start']()
        },
        'switcher:start': function () {
          var index = that.getIndex(that.$active)
          that.$indicator
            .find('.active').removeClass('active')
            .end()
            .find('[data-index="' + index + '"]').addClass('active')
        }
      })
    },
    'interval:start': function () {
      var that = this
      this.interval = window.setInterval(function () {
        that.animate('next')
      }, that.opts.delay || 3000)
    },
    'interval:stop': function () {
      root.clearInterval(this.interval)
    },
    getTransitionEvent: function () {
      var el = document.body || document.documentElement
          e  = null,
          transEndEventNames = {
            WebkitTransition : 'webkitTransitionEnd',
            MozTransition    : 'transitionend',
            OTransition      : 'oTransitionEnd otransitionend',
            transition       : 'transitionend'
          }

      for (var name in transEndEventNames) {
        if (el.style[name] !== undefined) {
          return transEndEventNames[name]
        }
      }
    },
    getNext: function (type, $active) {
      var index = this.getIndex($active),
          diff  = type == 'next' ? 1 : -1
      return this.$items.eq((index + diff) % this.$items.length)
    },
    getIndex: function (item) {
      return this.$items.index(item)
    },
    getKlass: function () {
      var arr = []
      switch (this.effect) {
        case 'fade':
          arr = ['next', 'prev', 'fade']
          break;
        case 'slide':
        default:
          arr = ['left', 'right', 'next', 'prev']
      }
      return arr
    },
    getDirection: function (type) {
      switch (this.effect) {
        case 'fade':
          return 'fade'
          break;
        case 'slide':
        default:
          return type == 'next' ? 'left' : 'right'
      }
    },
    to: function (index) {
      var next = this.$items.eq(index)
          curr = this.getIndex(this.$active)
      this.animate(index > curr ? 'next' : 'prev', next)
    },
    animate: function (type, next) {
      var $active   = this.$ele.find('.item.active'),
          $next     = next || this.getNext(type, $active),
          direction = this.getDirection(type)
          that      = this
      if ($next.hasClass('active') || that.inAnimate) {
        return
      }

      if (that.effect == 'slide') {
        $next.addClass(direction)
        $next[0].offsetWidth
        $active.addClass(direction)
        that.$active = $next.addClass(type)
      } else {
        $active.addClass(direction)
        that.$active = $next.addClass(type)
        $next[0].offsetWidth
        $next.addClass(direction)
      }

      that.$ele.trigger('switcher:start')
      that.inAnimate = true

      console.log(that.getTransitionEvent())
      that.$animateEle = { $active: $active, $next: $next }
      $active.one(that.getTransitionEvent(), $.proxy(that['transition:end'], that))
    },
    'transition:end': function () {
      this.$animateEle.$active.removeClass(this.klass.join(' ') + ' active')
      this.$animateEle.$next.removeClass(this.klass.join(' ')).addClass('active')
      this.inAnimate = false
    }
  }

  $.fn.switcher = function (option) {
    return this.each(function () {
      new Switcher($(this), $(this).data()).init()
    })
  }

  $(window).on('load', function () {
    $('[data-plugin="switcher"]').switcher()
  })

})(jQuery)
