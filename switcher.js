;(function ($) {

  var root = this

  function Switcher (ele, opts) {
    this.opts       = opts || {}
    this.$ele       = $(ele)
    this.$items     = this.opts.$items || this.$ele.find('.container > .item')
    this.$controls  = this.opts.$controls || this.$ele.find('.controls')
    this.$indicator = this.opts.$indicator || this.$ele.find('.indicator')
    this.$active    =
    this.interval   = null
    this.klass      = ['left', 'right', 'next', 'prev']
    this.inAnimate  = false
    this.effect     = this.opts.effect || 'slide'
  }

  Switcher.fn = Switcher.prototype = {
    init: function () {
      var that = this
      if (that.opts.interval) {
        that['interval:start']()
      }
      this.$controls.on('click', '[data-direction]', function () {
        that.animate($(this).data('direction'))
      })

      this.$indicator.on('click', '[data-index]', function () {
        that.to($(this).data('index'))
      })

      this.$ele.on({
        'mouseenter': function () {
          if (that.opts.interval) {
            that['interval:stop']()
          }
        },
        'mouseleave': function () {
          if (that.opts.interval) {
            that['interval:start']()
          }
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
      }, that.opts.delay || 2000)
    },
    'interval:stop': function () {
      root.clearInterval(this.interval)
    },
    getNext: function (type, $active) {
      var index = this.getIndex($active),
          diff  = type == 'next' ? 1 : -1
      return this.$items.eq((index + diff) % this.$items.length)
    },
    getIndex: function (item) {
      return this.$items.index(item)
    },
    to: function (index) {
      var next = this.$items.eq(index)
          curr = this.getIndex(this.$active)
      this.animate(index > curr ? 'next' : 'prev', next)
    },
    animate: function (type, next) {
      var $active   = this.$ele.find('.item.active'),
          $next     = next || this.getNext(type, $active),
          direction = type == 'next' ? 'left' : 'right',
          that      = this
      if ($next.hasClass('active') || that.inAnimate) {
        return
      }

      $next.addClass(direction)
      $next[0].offsetWidth
      $active.addClass(direction)
      that.$active = $next.addClass(type)

      that.$ele.trigger('switcher:start')
      that.inAnimate = true

      $active.one('webkitTransitionEnd', function () {
        $active.removeClass(that.klass.join(' ') + ' active')
        $next.removeClass(that.klass.join(' ')).addClass('active')
        that.inAnimate = false
      })

    },
  }

  $.fn.switcher = function (option) {
    return this.each(function () {
      var switcher = new Switcher($(this), $(this).data())
      switcher.init()
    })
  }

  $(window).on('load', function () {
    $('[data-plugin="switcher"]').switcher()
  })

})(jQuery)
