(function ($) {

  var yearScroll, monthScroll, dayScroll, currentInput, currentOption;

  var defaults = {
    format: "yyyy-MM-dd", // Set the date format
    yearStart: 2000, // Set the minimal year
    yearEnd: 2030 // Set the maximal year
  };

  //Config the IScroll plugin
  var scrollConf = {
    snap: 'li',
    snapSpeed: 600,
    probeType: 1,
    tap: true
  };

  //Date format help function
  function DateUtils(value) {
    if (typeof value === 'undefined') {
      this.date = new Date();
    }
    else if (value instanceof Date) {
      this.date = value;
    }
    else {
      this.date = new Date(value);
    }

    this.year = this.date.getFullYear();
    this.month = this.date.getMonth() + 1;
    this.day = this.date.getDate();
    this.hour = this.date.getHours();
    this.minute = this.date.getMinutes();
    this.second = this.date.getSeconds();
  }

  DateUtils.prototype =
  {
    constructor: DateUtils,
    toString: function (format) {

      if (this.date == null) {
        return null;
      }

      if (typeof format === 'string') {

        var result = format
            .replace(/yyyy?/g, this.year)
            .replace(/yy/g, this.year % 100)

            .replace(/MM/g, (this.month > 9 ? '' : '0') + this.month)
            .replace(/M/g, this.month)

            .replace(/dd/g, (this.day > 9 ? '' : '0') + this.day)
            .replace(/d/g, this.day)

            .replace(/HH/g, (this.hour > 9 ? '' : '0') + this.hour)
            .replace(/H/g, this.hour)

            .replace(/hh/g, (this.hour % 12 > 9 ? '' : '0') + (this.hour % 12 == 0 ? 12 : this.hour % 12))
            .replace(/h/g, this.hour % 12 == 0 ? 12 : this.hour % 12)

            .replace(/mm/g, (this.minute > 9 ? '' : '0') + this.minute)
            .replace(/m/g, this.minute)

            .replace(/ss/g, (this.second > 9 ? '' : '0') + this.second)
            .replace(/s/g, this.second);

        return result;
      }

      return this.date.toString();
    }
  };

  function DatePicker(element, option) {
    var _this = this;
    _this.option = option;
    _this.input = $(element);

    _this.input.on('tap', function () {

      //Save current tap input object
      currentInput = this;
      currentOption = _this.option;

      initDatePickerDom(_this.option);

      var container = $('.date-picker-pop-panel');
      if (container.hasClass('show')) {
        hidePanel();
      }
      else {
        showPanel();

        var currDate = $(this).val() != '' ? new Date($(this).val()) : new Date();
        initValue(currDate);
      }
    });
  }

  function preZero(num) {
    num = num || '0';
    num = parseInt(num);

    if (num < 10) {
      return '0' + num;
    }
    else {
      return num;
    }
  }

  function getMonthDays(year, month) {
    return new Date(year, parseInt(month) + 1, 0).getDate();
  }

  function initDatePickerDom(option) {
    var container = $('.date-picker-pop-panel'),
        mpYear = $('.date-picker-year', container),
        mpMonth = $('.date-picker-month', container),
        mpDay = $('.date-picker-day', container);

    var defaultDate = new Date(),
        dYear = defaultDate.getFullYear(),
        dMonth = defaultDate.getMonth(),
        dDate = defaultDate.getDate();

    var yearStr = '', monthStr = '', dayStr = '', i, select;
    for (i = option.yearStart; i < option.yearEnd; i++) {
      select = i == dYear ? 'selected' : '';
      yearStr += '<li class="' + select + '" data-year="' + i + '">' + i + '年</li>';
    }
    yearStr += '<li></li><li></li>';
    mpYear.html('<ul><li class="date-picker-title">选择年份</li><li></li></ul>').find('ul').append(yearStr);

    for (i = 1; i <= 12; i++) {
      select = i == dMonth ? 'selected' : '';
      monthStr += '<li class="' + select + '" data-month="' + (i - 1) + '">' + preZero(i) + '月</li>';
    }
    monthStr += '<li></li><li></li>';
    mpMonth.html('<ul><li class="date-picker-title">选择月份</li><li></li></ul>').find('ul').append(monthStr);

    var defaultDays = getMonthDays(dYear, dMonth);
    for (i = 1; i <= defaultDays; i++) {
      select = i == dDate ? 'selected' : '';
      dayStr += '<li class="' + select + '" data-day="' + i + '">' + preZero(i) + '日</li>';
    }
    dayStr += '<li></li><li></li>';
    mpDay.html('<ul><li class="date-picker-title">选择日期</li><li></li></ul>').find('ul').append(dayStr);

    initDatePickerIScroll(mpYear, mpMonth, mpDay);
  }

  function appendDatePickerDom() {
    var picker = $('#zepto-date-picker');
    if (picker.length <= 0) {
      var html = '<div id="zepto-date-picker"><div class="date-picker-mask"></div><div class="date-picker-pop-panel"><div class="date-picker-panel"><h3>请选择时间</h3><div class="date-picker-body"><div class="date-picker-year"></div><div class="date-picker-month"></div><div class="date-picker-day"></div><div class="date-picker-indicate"></div></div><div class="date-picker-confirm"><a href="javascript:void(0);" class="date-picker-cancel">取消</a><a href="javascript:void(0);" class="date-picker-now">今天</a><a href="javascript:void(0);" class="date-picker-ok">确定</a></div></div></div></div>';
      $(document.body).append(html);

      var container = $('.date-picker-pop-panel'),
          mpYear = $('.date-picker-year', container),
          mpMonth = $('.date-picker-month', container),
          mpDay = $('.date-picker-day', container);

      $('.date-picker-ok', container).on('tap', function () {
        var year = mpYear.find('.selected').data('year');
        var month = mpMonth.find('.selected').data('month');
        var day = mpDay.find('.selected').data('day');

        var dateUtils = new DateUtils(new Date(year, month, day));
        $(currentInput).val(dateUtils.toString(currentOption.format));

        hidePanel();
      });

      $('.date-picker-cancel', container).on('tap', function () {
        hidePanel();
      });

      $('.date-picker-now', container).on('tap', function () {
        var today = new DateUtils(new Date());
        $(currentInput).val(today.toString(currentOption.format));

        hidePanel();
      });

      $('.date-picker-mask').on('tap', function () {
        hidePanel();
      });
    }
  }

  function initDatePickerIScroll(mpYear, mpMonth, mpDay) {
    document.addEventListener('touchmove', function (e) {
      e.preventDefault();
    }, false);

    yearScroll = new IScroll('.date-picker-year', scrollConf);
    yearScroll.on('scroll', function () {
      updateSelected(mpYear, this);
    });
    yearScroll.on('scrollEnd', function () {
      updateSelected(mpYear, this);
      refreshDayPickerDom(mpYear, mpMonth, mpDay);
    });

    monthScroll = new IScroll('.date-picker-month', scrollConf);
    monthScroll.on('scroll', function () {
      updateSelected(mpMonth, this);

    });
    monthScroll.on('scrollEnd', function () {
      updateSelected(mpMonth, this);
      refreshDayPickerDom(mpYear, mpMonth, mpDay);
    });

    dayScroll = new IScroll('.date-picker-day', scrollConf);
    dayScroll.on('scroll', function () {
      updateSelected(mpDay, this);
    });
    dayScroll.on('scrollEnd', function () {
      updateSelected(mpDay, this);
    });

    mpYear.on('tap', 'li', function () {
      scrollToYear($(this));
    });
    mpMonth.on('tap', 'li', function () {
      scrollToMonth($(this));
    });
    mpDay.on('tap', 'li', function () {
      scrollToDay($(this));
    });
  }

  function refreshDayPickerDom(mpYear, mpMonth, mpDay) {
    var checkedYear = mpYear.find('li.selected').data('year');
    var checkedMonth = mpMonth.find('li.selected').data('month');
    var checkedDay = mpDay.find('li.selected').data('day');

    var days = getMonthDays(checkedYear, checkedMonth);
    var dayStr = '<ul><li class="date-picker-title">选择日期</li><li></li>';

    var i;
    for (i = 1; i <= days; i++) {
      var sel = i == checkedDay ? 'selected' : '';
      dayStr += '<li class="' + sel + '" data-day="' + i + '">' + preZero(i) + '日</li>';
    }
    dayStr += '<li></li><li></li></ul>';
    mpDay.html(dayStr);

    //We change the day dom node, so we need to init the day IScroll again
    dayScroll.destroy();
    dayScroll = new IScroll('.date-picker-day', scrollConf);
    dayScroll.on('scroll', function () {
      updateSelected(mpDay, this);
    });
    dayScroll.on('scrollEnd', function () {
      updateSelected(mpDay, this);
    });

    setTimeout(function () {
      var dayEl = mpDay.find('li[data-day="' + checkedDay + '"]');
      if (dayEl.length > 0) {
        scrollToDay(dayEl);
      }
    }, 10);
  }

  function updateSelected(container, iScroll) {
    var itemHeight = 40;
    var index = (-iScroll.y) / itemHeight + 2;
    var current = container.find('li').eq(index);
    current.addClass('selected').siblings().removeClass('selected');
  }

  function scrollToYear(element) {
    if (element) {
      var target = element.prev('li').prev('li');
      yearScroll.scrollToElement(target[0]);
    }
  }

  function scrollToMonth(element) {
    if (element) {
      var target = element.prev('li').prev('li');
      monthScroll.scrollToElement(target[0]);
    }
  }

  function scrollToDay(element) {
    if (element) {
      var target = element.prev('li').prev('li');
      dayScroll.scrollToElement(target[0]);
    }
  }

  function showPanel() {
    $('.date-picker-pop-panel, .date-picker-mask').addClass('show');
  }

  function hidePanel() {
    $('.date-picker-pop-panel, .date-picker-mask').removeClass('show');
  }

  function initValue(currDate) {
    var yearItem = $('.date-picker-year li[data-year="' + currDate.getFullYear() + '"]'),
        monthItem = $('.date-picker-month li[data-month="' + currDate.getMonth() + '"]'),
        dayItem = $('.date-picker-day li[data-day="' + currDate.getDate() + '"]');

    scrollToYear(yearItem);
    scrollToMonth(monthItem);
    scrollToDay(dayItem);
  }

  function plugin(option) {
    var context = $.extend({}, defaults, typeof option === 'object' && option);

    appendDatePickerDom();

    return this.each(function () {
      var element = $(this);

      var data = element.data('fz.' + "date-picker");
      if (!data) element.data('fz.' + "date-picker", new DatePicker(this, context));
    });
  }

  $.fn.datepicker = plugin;

})(Zepto);