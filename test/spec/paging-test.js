define(function(require){
    var Paging = require('paging'),
        $ = require('jquery');

describe("A suite", function() {
  it("contains spec with an expectation", function() {
    expect(true).toBe(true);
  });
});

describe('Paging', function(){
    var paging;

    beforeEach(function(){
        paging = new Paging();
    });

    describe('init', function(){
        var tmp = null;

        beforeEach(function(){
            tmp = new Paging();
            spyOn(tmp, 'regEvent');
        });


        it('可以覆盖默认配置', function(){


            var currPage = tmp.currPage,
                eventType = tmp.eventType,
                pageStartFrom = tmp.pageStartFrom,
                maxPageToTriggerHide = tmp.maxPageToTriggerHide,
                maxNumBtnShow = tmp.maxNumBtnShow,
                calcFirst = tmp.calcFirst;

            tmp.init({
                currPage: currPage+1,
                eventType: eventType+'aa',
                pageStartFrom: pageStartFrom+1,
                maxPageToTriggerHide: maxPageToTriggerHide+1,
                maxNumBtnShow: maxNumBtnShow+1,
                calcFirst: calcFirst+'aa',
                $parDom: $('body')
            });

            expect(tmp.currPage).not.toBe(currPage);
            expect(tmp.eventType).not.toBe(eventType);
            expect(tmp.pageStartFrom).not.toBe(pageStartFrom);
            expect(tmp.maxPageToTriggerHide).not.toBe(maxPageToTriggerHide);
            expect(tmp.maxNumBtnShow).not.toBe(maxNumBtnShow);
            expect(tmp.calcFirst).not.toBe(calcFirst);
        });

        it('执行事件注册', function(){
            tmp.init({
                $parDom: $('body')
            });
            expect(tmp.regEvent).toHaveBeenCalled();
        });

        it('各个功能按钮可以点击');
    });

    describe('fixPage', function(){
        var tmp = null;
        beforeEach(function(){
            tmp = new Paging();
        });

        it('可以自动计算最大页码的数值', function(){
            tmp.totalPage = 10;
            tmp.pageStartFrom = 1;

            tmp.fixPage();
            expect(tmp.maxPage).toBe(1+10-1);

            tmp.pageStartFrom = 0;
            tmp.fixPage();
            expect(tmp.maxPage).toBe(0+10-1);

            tmp.pageStartFrom = -5;
            tmp.fixPage();
            expect(tmp.maxPage).toBe(-5+10-1);

            tmp.pageStartFrom = 10;
            tmp.fixPage();
            expect(tmp.maxPage).toBe(10+10-1);
        });

        it('可以自动校正currPage过小值的溢出', function(){
            tmp.totalPage = 10;
            tmp.pageStartFrom = 1;

            // 试图设定currPage为一个过小值
            tmp.currPage = 0;
            tmp.fixPage();
            expect(tmp.currPage).toBe(1);
        });

        it('可以自动校正currPage过大值的溢出', function(){
            tmp.totalPage = 10;
            tmp.pageStartFrom = 1;

            // 试图设定currPage为一个过大值
            tmp.currPage = 100;
            tmp.fixPage();
            expect(tmp.currPage).toBe(tmp.maxPage);
        });

        it('可以设定currPage为初始值', function(){
            tmp.totalPage = 10;
            tmp.pageStartFrom = 1;

            // 试图设定currPage为初始值
            tmp.currPage = 1;
            tmp.fixPage();
            expect(tmp.currPage).toBe(1);
        });

        it('可以设定currPage为最大值', function(){
            tmp.totalPage = 10;
            tmp.pageStartFrom = 1;

            // 试图设定currPage为最大值
            tmp.currPage = 1+10-1;
            tmp.fixPage();
            expect(tmp.currPage).toBe(tmp.maxPage);
        });

        it('可以在maxPageToTriggerHide大于totalPage的时候，显示的按钮数量为totalPage', function(){
            tmp.totalPage = 10;
            tmp.maxPageToTriggerHide = 20;
            tmp.fixPage();

            expect(tmp.leftNum+tmp.rightNum+1).toBe(tmp.totalPage);
        });
        it('可以在maxPageToTriggerHide等于totalPage的时候，显示的按钮数量为totalPage', function(){
            tmp.totalPage = 20;
            tmp.maxPageToTriggerHide = 20;
            tmp.fixPage();

            expect(tmp.leftNum+tmp.rightNum+1).toBe(tmp.totalPage);
        });
        it('可以在maxPageToTriggerHide小于totalPage并且maxNumBtnShow小于totalPage的时候，显示的按钮数量为maxNumBtnShow', function(){
            tmp.totalPage = 20;
            tmp.maxPageToTriggerHide = 10;
            tmp.maxNumBtnShow = 10;
            tmp.fixPage();

            expect(tmp.leftNum+tmp.rightNum+1).toBe(tmp.maxNumBtnShow);
        });
        it('可以在maxPageToTriggerHide小于totalPage并且maxNumBtnShow等于totalPage的时候，显示的按钮数量为maxNumBtnShow', function(){
            tmp.totalPage = 20;
            tmp.maxPageToTriggerHide = 10;
            tmp.maxNumBtnShow = tmp.totalPage;
            tmp.fixPage();

            expect(tmp.leftNum+tmp.rightNum+1).toBe(tmp.maxNumBtnShow);
        });
        it('可以在maxPageToTriggerHide小于totalPage并且maxNumBtnShow大于totalPage的时候，显示的按钮数量为totalPage', function(){
            tmp.totalPage = 20;
            tmp.maxPageToTriggerHide = 10;
            tmp.maxNumBtnShow = 30;
            tmp.fixPage();

            expect(tmp.leftNum+tmp.rightNum+1).toBe(tmp.totalPage);
        });

        xit('在maxNumBtnShow为偶数并且不能完全显示的时候，左右两边数量不一样', function(){
            tmp.totalPage = 30;
            tmp.maxPageToTriggerHide = 10;
            tmp.maxNumBtnShow = 10;
            tmp.currPage = 15;
            tmp.fixPage();

            expect(tmp.leftNum + tmp.rightNum + 1).toBe(tmp.maxNumBtnShow);
            expect(tmp.leftNum !== tmp.rightNum).toBe(true);
        });

        xit('在maxNumBtnShow为奇数并且不能完全显示的时候，左右两边数量一样', function(){
            tmp.totalPage = 30;
            tmp.maxPageToTriggerHide = 10;
            tmp.maxNumBtnShow = 11;
            tmp.currPage = 15;
            tmp.fixPage();

            expect(tmp.leftNum + tmp.rightNum + 1).toBe(tmp.maxNumBtnShow);
            expect(tmp.leftNum === tmp.rightNum).toBe(true);
        });

        it('可以根据calcFirst在totalPage为偶数并且不能全部显示的时候，控制左右两边能显示的数量的不同',function(){
            tmp.totalPage = 30; // 为偶数使得currPage左右两侧能显示的不是一样多
            tmp.maxPageToTriggerHide = 10;
            tmp.maxNumBtnShow = 10;
            tmp.currPage = 15;
            tmp.calcFirst = 'left';
            tmp.fixPage();

            expect(tmp.leftNum === tmp.halfOfMaxNumBtnShow).toBe(true);

            tmp.calcFirst = 'right';
            tmp.fixPage();
            expect(tmp.rightNum === tmp.halfOfMaxNumBtnShow).toBe(true);
        });

        it('在calcFirst为left的时候，如果两边都能接触边界，则左边接触', function(){
            tmp.totalPage = 10; // 为偶数使得currPage左右两侧能显示的不是一样多
            tmp.maxPageToTriggerHide = 5;
            tmp.maxNumBtnShow = 8;
            tmp.currPage = 5;
            tmp.calcFirst = 'left';
            tmp.fixPage();

            console.log(tmp.leftNum, tmp.rightNum);
            expect(tmp.currPage - tmp.leftNum === tmp.pageStartFrom).toBe(true);
        });

        it('在calcFirst为right的时候，如果两边都能接触边界，则右边接触', function(){
            tmp.totalPage = 10; // 为偶数使得currPage左右两侧能显示的不是一样多
            tmp.maxPageToTriggerHide = 5;
            tmp.maxNumBtnShow = 8;
            tmp.currPage = 5;
            tmp.calcFirst = 'right';
            tmp.fixPage();

            expect(tmp.rightNum + tmp.currPage === tmp.maxPage).toBe(true);
        });

    });

    describe('sort', function(){
        it('可以根据提供的排序展示对应顺序的翻页');
        it('可以根据提供的排序移除对应的按钮');
    });

    describe('function btn', function(){
        it('可以设定指定的页高亮');
        it('可以用上一页来使得页码减少, 在到达最小值时不再变动');
        it('可以用下一页来使得页码增加, 在到达最大值时不再变动');
        it('可以使用首页来使得页码设定为pageStartFrom');
        it('可以使用尾页来使得页码设定为totalPage-pageStartFrom');
    });
});


});
