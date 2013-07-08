/*
* Name: chain's datatime picker 0.8
* Create: 2013-06-24
* Update: 2013-07-08
* Desc: 
*/
////////////////////////////////////////////////////////////////////////////////////////////////////////
function ChainDateTime(options) {
    this.options = options; //注意，options的值只能被初始化或者通过this.option函数进行修改

    options.content = options.content || new Date();
    options.format_in = options.format_in || "yyyy-mm-dd HH:MM:SS";
    options.format_out = options.format_out || "yyyy-mm-dd HH:MM:SS";
    options.showDate = (options.showDate != undefined) ? options.showDate : true;
    options.showTime = (options.showTime != undefined) ? options.showTime : true;
    options.showButtons = (options.showButtons != undefined) ? options.showButtons : true;
    options.year_from = options.year_from || 2010;
    options.year_to = options.year_to || 2030;
    options.onCancel = options.onCancel || function (cdt) { };
    options.onDone = options.onDone || function (cdt) { };
    options.onChanged = options.onChanged || function (cdt) { };

    options.mode = options.mode || "modeless"; //modal：以模式对话框的形式显示；modeless；inline：内联显示（即将控件显示在container内部）
    options.position = options.position || {}; //mode不为inline时有效，指定显示位置；参考：jqueryui.position、jqueryui.dialog的pisition参数
    options.container = options.container || $(document.body); //mode为inline时有效，指定容器，可以jquery对象，或者是jquery选择符

    function _createOptionsString(from, to) {
        var options = '';
        var v;
        for (var i = from; i <= to; i++) {
            v = (i < 10) ? ('0' + i) : i;
            options += '<option value="' + i + '">' + v + '</option>';
        }
        return options;
    };

    var pThis = this;
    var currentDateTime = new Date(); //本语句的目的并不是让currentDateTime表示系统的当前时间，而是让currentDateTime成为一个Date对象；该变量用来存放用户当前选择的日期时间
    var $control = (function _createPicker() {
        function _createSelectString(className, from, to) {
            return '<select class="' + className + '">' + _createOptionsString(from, to) + '</select>';
        };

        var $control = $('<div title="DateTimePicker">'
            + '<span class="date">'
                + _createSelectString("year", 1999, 1999) + '年' //year由options动态生成
                + _createSelectString("month", 1, 12) + '月'
                + _createSelectString("day", 1, 28) + '日' //根据year和month动态生成
            + '</span>&nbsp;&nbsp;'
            + '<span class="time">'
                + _createSelectString("hour", 0, 23) + '时'
                + _createSelectString("minute", 0, 59) + '分'
                + _createSelectString("second", 0, 59) + '秒'
            + '</span>'
            + '<span class="buttons">'
            + '<button type="button" class="OK">确定</button>&nbsp;&nbsp;'
            + '<button type="button" class="Cancel">取消</button>'
            + '</span>'
            + '</div>');

        function _getDays(year, month) {
            year = parseInt(year);
            month = parseInt(month);
            switch (month) {
                case 2:
                    if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)) return 29;
                    else return 28;
                case 4:
                case 6:
                case 9:
                case 11: return 30;
                default: return 31;
            }
        };
        function _refreshDays(year, month, $select) {
            var oldValue = $select.val();
            $select.html(_createOptionsString(1, _getDays(year, month)));
            $select.val(oldValue);
        }
        function _eventYearOrMonthChanged() { _refreshDays($(".year", $control).val(), $(".month", $control).val(), $(".day", $control)); }

        $(".year", $control).change(_eventYearOrMonthChanged);
        $(".month", $control).change(_eventYearOrMonthChanged);

        $(".year", $control).change(function (event) { currentDateTime.setYear(event.target.value); if (pThis.options.onChanged) pThis.options.onChanged(pThis); });
        $(".month", $control).change(function (event) { currentDateTime.setMonth(parseInt(event.target.value) - 1); if (pThis.options.onChanged) pThis.options.onChanged(pThis); });
        $(".day", $control).change(function (event) { currentDateTime.setDate(event.target.value); if (pThis.options.onChanged) pThis.options.onChanged(pThis); });
        $(".hour", $control).change(function (event) { currentDateTime.setHours(event.target.value); if (pThis.options.onChanged) pThis.options.onChanged(pThis); });
        $(".minute", $control).change(function (event) { currentDateTime.setMinutes(event.target.value); if (pThis.options.onChanged) pThis.options.onChanged(pThis); });
        $(".second", $control).change(function (event) { currentDateTime.setSeconds(event.target.value); if (pThis.options.onChanged) pThis.options.onChanged(pThis); });

        $(".OK", $control).click(function () {
            $control.hide();
            if ($control.dialog()) { if ($control.dialog("isOpen")) { $control.dialog("destroy"); } }
            if (pThis.options.onDone) pThis.options.onDone(pThis);
        });

        $(".Cancel", $control).click(function () {
            $control.hide();
            if ($control.dialog()) { if ($control.dialog("isOpen")) { $control.dialog("destroy"); } }
            if (pThis.options.onCancel) pThis.options.onCancel(pThis);
        });

        return $control;
    })();

    function _displayMode() {
        var mode = pThis.options.mode;
        var position = pThis.options.position;
        var $container = pThis.options.container;
        
        $control.show();
        
        switch (mode) {
            case "modal":
                $control.dialog({
                    modal: true,
                    position: position,
                    minWidth: 600,
                    minHeight: 200,
                 });
                break;
            case "modeless":
                $control.dialog({
                    modal: false,
                    position: position,
                    minWidth: 600,
                    minHeight: 200
                });
                break;
            case "inline":
                $container.append($control);
                break;
        }
    }


    var specialArguments = ",content,showDate,showTime,showButtons,year_from,year_to,";
    function _isSpecialArgument(arg) { return specialArguments.indexOf("," + arg + ",") > -1; };
    this.option = function (option, value) {
        if (option instanceof Object) {
            for (var i in option) {
                if (!_isSpecialArgument(i)) this.options[i] = option[i]; //保证option中的所有参数都被浅拷贝，即使其不是ChainDateTime的有效参数
            }
            if (option.year_from && option.year_to) this.options.year_from = option.year_from;
            if (option.year_to) this.option("year_to", option.year_to); //year范围在content之前设置
            for (var i in option) {
                if (_isSpecialArgument(i) && (i != "year_from") && (i != "year_to")) this.option(i, option[i]);
            } //两个for循环不可合并，要保证特殊参数在非特殊参数之后处理
        }
        else if (value != undefined) {
            this.options[option] = value;
            switch (option) {
                case "content":
                    currentDateTime = (typeof (value) == "string") ? ChainDateTime.parseDateTime(value, this.options.format_in) : value;
                    $(".year", $control).val(currentDateTime.getFullYear());
                    $(".month", $control).val(currentDateTime.getMonth() + 1);
                    $(".day", $control).val(currentDateTime.getDate());
                    $(".hour", $control).val(currentDateTime.getHours());
                    $(".minute", $control).val(currentDateTime.getMinutes());
                    $(".second", $control).val(currentDateTime.getSeconds());
                    break;
                case "showDate":
                    value ? $(".date", $control).show() : $(".date", $control).hide();
                    break;
                case "showTime":
                    value ? $(".time", $control).show() : $(".time", $control).hide();
                    break;
                case "showButtons":
                    value ? $(".buttons", $control).show() : $(".buttons", $control).hide();
                    break;
                case "year_from":
                case "year_to":
                    var $year = $(".year", $control);
                    var oldValue = $year.val();
                    $year.html(_createOptionsString(this.options.year_from, this.options.year_to)).val(oldValue);
                    break;
            }
        }
        else {
            switch (option) {
                case "show":
                    _displayMode();
                    break;
                case "hide":
                    $control.hide();
                    break;
                case "getContent":
                    return ChainDateTime.formatDateTime(currentDateTime, this.options.format_out);
                case "getDateTime":
                    return currentDateTime;
                case "$control":
                    return $control;
                default:
                    return this.options[option];
            }
        }
    }

    this.option(options);
}

//static method
function parseDateTimeHelper(nodes, node) {
    var new_nodes = [];
    for (var i = 0; i < nodes.length; i++) {
        var a = nodes[i].split(node);
        for (var j = 0; j < a.length; j++) {
            if (j != 0) { new_nodes[new_nodes.length] = node; }
            new_nodes[new_nodes.length] = a[j];
        }
    }
    return new_nodes;
};
ChainDateTime.parseDateTime = function (str, fmt) {
    if (!str) return new Date();
    var v = { yyyy: 0, mm: 0, dd: 0, HH: 0, MM: 0, SS: 0 };
    var nodes = [fmt];
    for (var node in v) { nodes = parseDateTimeHelper(nodes, node); }

    fmt = fmt.replace(/\\/ig, "\\\\");
    fmt = fmt.replace(/yyyy/g, "(\\d{2}|\\d{4})");
    fmt = fmt.replace(/mm/g, "(\\d{1,2})");
    fmt = fmt.replace(/dd/g, "(\\d{1,2})");
    fmt = fmt.replace(/HH/g, "(\\d{1,2})");
    fmt = fmt.replace(/MM/g, "(\\d{1,2})");
    fmt = fmt.replace(/SS/g, "(\\d{1,2})");

    var r = (new RegExp(fmt)).exec(str);
    if (!r) { return new Date(); }

    var index = 1;
    for (var i = 0; i < nodes.length; i++) {
        if (v[nodes[i]] != undefined) v[nodes[i]] = r[index++];
    }

    return new Date(v.yyyy, v.mm - 1, v.dd, v.HH, v.MM, v.SS);
};

ChainDateTime.formatDateTime = function (datetime, fmt) {
    var dateMarkers = {
        yyyy: ['getFullYear', function (v) { return v; } ],
        mm: ['getMonth', function (v) { ++v; return v < 10 ? '0' + v : v; } ],
        dd: ['getDate', function (v) { return v < 10 ? '0' + v : v; } ],
        HH: ['getHours', function (v) { return v < 10 ? '0' + v : v; } ],
        MM: ['getMinutes', function (v) { return v < 10 ? '0' + v : v; } ],
        SS: ['getSeconds', function (v) { return v < 10 ? '0' + v : v; } ]
    };

    var dateTxt = fmt;
    for (var mark in dateMarkers) {
        var re = new RegExp(mark, "g");
        var v = datetime[(dateMarkers[mark])[0]]();
        dateTxt = dateTxt.replace(re, (dateMarkers[mark])[1](v));
    }
    return dateTxt;
};
