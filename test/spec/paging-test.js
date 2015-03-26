define(function(require){
    var Paging = require('paging'),
        $ = require('jquery');

describe("A suite", function() {
  it("contains spec with an expectation", function() {
    expect(true).toBe(true);
  });
});

describe('Paging', function(){

    describe('init', function(){
        var me = null;

        beforeEach(function(){
            me = new Paging();
            spyOn(me, 'regEvent');
            spyOn(me, 'goLeftEnd');
            spyOn(me, 'goRightEnd');
            spyOn(me, 'goPrev');
            spyOn(me, 'goNext');
            spyOn(me, 'showPage');
        });


        it('可以覆盖默认配置', function(){


            var currPage = me.currPage,
                eventType = me.eventType,
                pageStartFrom = me.pageStartFrom,
                maxPageToTriggerHide = me.maxPageToTriggerHide,
                maxNumBtnShow = me.maxNumBtnShow,
                calcFirst = me.calcFirst;

            me.init({
                currPage: currPage+1,
                eventType: eventType+'aa',
                pageStartFrom: pageStartFrom+1,
                maxPageToTriggerHide: maxPageToTriggerHide+1,
                maxNumBtnShow: maxNumBtnShow+1,
                calcFirst: calcFirst+'aa',
                $parDom: $('<div></div>')
            });

            expect(me.currPage).not.toBe(currPage);
            expect(me.eventType).not.toBe(eventType);
            expect(me.pageStartFrom).not.toBe(pageStartFrom);
            expect(me.maxPageToTriggerHide).not.toBe(maxPageToTriggerHide);
            expect(me.maxNumBtnShow).not.toBe(maxNumBtnShow);
            expect(me.calcFirst).not.toBe(calcFirst);
        });

        it('执行事件注册', function(){
            me.init({
                $parDom: $('<div></div>')
            });
            me.repaint();
            expect(me.regEvent).toHaveBeenCalled();
        });

        xit('首页按钮点击有效', function(){
            me.init({
                $parDom: $('<div></div>')
            });
            me.fixPage();
            me.makeHtml();
            me.$parDom.html(me.sort());
            me.html.leftEndBtn.trigger('click');

            expect(me.goLeftEnd).toHaveBeenCalled();
        });

        xit('尾页按钮点击有效', function(){
            me.init({
                $parDom: $('<div></div>')
            });
            me.repaint();
            me.html.rightEndBtn.trigger('click');

            expect(me.goRightEnd).toHaveBeenCalled();
        });
        xit('上一页按钮点击有效', function(){
            me.init({
                $parDom: $('<div></div>')
            });
            me.repaint();
            me.html.prevBtn.trigger('click');

            expect(me.goPrev).toHaveBeenCalled();
        });
        xit('下一页按钮点击有效', function(){
            me.init({
                $parDom: $('<div></div>')
            });
            me.repaint();
            me.html.nextBtn.trigger('click');

            expect(me.goNext).toHaveBeenCalled();
        });
        xit('numBtn按钮点击有效', function(){
            me.init({
                $parDom: $('<div></div>')
            });
            me.repaint();
            me.html.rightNumBtn.eq(1).trigger('click');

            expect(me.showPage).toHaveBeenCalled();
        });
    });

    describe('fixPage', function(){
        var me = null;
        beforeEach(function(){
            me = new Paging();
        });

        it('可以自动计算最大页码的数值', function(){
            me.totalPage = 10;
            me.pageStartFrom = 1;

            me.fixPage();
            expect(me.maxPage).toBe(1+10-1);

            me.pageStartFrom = 0;
            me.fixPage();
            expect(me.maxPage).toBe(0+10-1);

            me.pageStartFrom = -5;
            me.fixPage();
            expect(me.maxPage).toBe(-5+10-1);

            me.pageStartFrom = 10;
            me.fixPage();
            expect(me.maxPage).toBe(10+10-1);
        });

        it('可以自动校正currPage过小值的溢出', function(){
            me.totalPage = 10;
            me.pageStartFrom = 1;

            // 试图设定currPage为一个过小值
            me.currPage = 0;
            me.fixPage();
            expect(me.currPage).toBe(1);
        });

        it('可以自动校正currPage过大值的溢出', function(){
            me.totalPage = 10;
            me.pageStartFrom = 1;

            // 试图设定currPage为一个过大值
            me.currPage = 100;
            me.fixPage();
            expect(me.currPage).toBe(me.maxPage);
        });

        it('可以设定currPage为初始值', function(){
            me.totalPage = 10;
            me.pageStartFrom = 1;

            // 试图设定currPage为初始值
            me.currPage = 1;
            me.fixPage();
            expect(me.currPage).toBe(1);
        });

        it('可以设定currPage为最大值', function(){
            me.totalPage = 10;
            me.pageStartFrom = 1;

            // 试图设定currPage为最大值
            me.currPage = 1+10-1;
            me.fixPage();
            expect(me.currPage).toBe(me.maxPage);
        });

        it('可以在maxPageToTriggerHide大于totalPage的时候，显示的按钮数量为totalPage', function(){
            me.totalPage = 10;
            me.maxPageToTriggerHide = 20;
            me.fixPage();

            expect(me.leftNum+me.rightNum+1).toBe(me.totalPage);
        });
        it('可以在maxPageToTriggerHide等于totalPage的时候，显示的按钮数量为totalPage', function(){
            me.totalPage = 20;
            me.maxPageToTriggerHide = 20;
            me.fixPage();

            expect(me.leftNum+me.rightNum+1).toBe(me.totalPage);
        });
        it('可以在maxPageToTriggerHide小于totalPage并且maxNumBtnShow小于totalPage的时候，显示的按钮数量为maxNumBtnShow', function(){
            me.totalPage = 20;
            me.maxPageToTriggerHide = 10;
            me.maxNumBtnShow = 10;
            me.fixPage();

            expect(me.leftNum+me.rightNum+1).toBe(me.maxNumBtnShow);
        });
        it('可以在maxPageToTriggerHide小于totalPage并且maxNumBtnShow等于totalPage的时候，显示的按钮数量为maxNumBtnShow', function(){
            me.totalPage = 20;
            me.maxPageToTriggerHide = 10;
            me.maxNumBtnShow = me.totalPage;
            me.fixPage();

            expect(me.leftNum+me.rightNum+1).toBe(me.maxNumBtnShow);
        });
        it('可以在maxPageToTriggerHide小于totalPage并且maxNumBtnShow大于totalPage的时候，显示的按钮数量为totalPage', function(){
            me.totalPage = 20;
            me.maxPageToTriggerHide = 10;
            me.maxNumBtnShow = 30;
            me.fixPage();

            expect(me.leftNum+me.rightNum+1).toBe(me.totalPage);
        });

        it('可以根据calcFirst在totalPage为偶数并且不能全部显示的时候，控制左右两边能显示的数量的不同',function(){
            me.totalPage = 30; // 为偶数使得currPage左右两侧能显示的不是一样多
            me.maxPageToTriggerHide = 10;
            me.maxNumBtnShow = 10;
            me.currPage = 15;
            me.calcFirst = 'left';
            me.fixPage();

            expect(me.leftNum === me.halfOfMaxNumBtnShow).toBe(true);

            me.calcFirst = 'right';
            me.fixPage();
            expect(me.rightNum === me.halfOfMaxNumBtnShow).toBe(true);
        });

        it('在calcFirst为left的时候，如果两边都能接触边界，则左边接触', function(){
            me.totalPage = 10; // 为偶数使得currPage左右两侧能显示的不是一样多
            me.maxPageToTriggerHide = 5;
            me.maxNumBtnShow = 8;
            me.currPage = 5;
            me.calcFirst = 'left';
            me.fixPage();

            expect(me.currPage - me.leftNum === me.pageStartFrom).toBe(true);
        });

        it('在calcFirst为right的时候，如果两边都能接触边界，则右边接触', function(){
            me.totalPage = 10; // 为偶数使得currPage左右两侧能显示的不是一样多
            me.maxPageToTriggerHide = 5;
            me.maxNumBtnShow = 9;
            me.currPage = 5;
            me.calcFirst = 'right';
            me.fixPage();

            expect(me.rightNum + me.currPage === me.maxPage).toBe(true);
        });

    });

    describe('makeHtml', function(){
        var me;
        beforeEach(function(){
            me = new Paging();
        })
        it('可以给按钮加上对应的data',function(){
            me.currPage = 5;
            me.pageStartFrom = 1;
            me.totalPage = 10;
            me.maxPageToTriggerHide = 5;
            me.maxNumBtnShow = 6;

            me.fixPage();
            me.makeHtml();


            expect(me.html.leftNumBtn.eq(0).data('role')).not.toBe(undefined);
            expect(me.html.rightNumBtn.eq(0).data('role')).not.toBe(undefined);
            expect(me.html.leftEndBtn.eq(0).data('role')).not.toBe(undefined);
            expect(me.html.rightEndBtn.eq(0).data('role')).not.toBe(undefined);
            expect(me.html.prevBtn.eq(0).data('role')).not.toBe(undefined);
            expect(me.html.nextBtn.eq(0).data('role')).not.toBe(undefined);
            expect(me.html.currBtn.eq(0).data('role')).not.toBe(undefined);
        });
        it('可以在初始页的时候，不生成leftNumBtn',function(){
            me.currPage = 1;
            me.pageStartFrom = 1;

            me.fixPage();
            me.makeHtml();

            expect(me.html.leftNumBtn === '').toBe(true);
        });
        it('可以在初始页的时候，上一页和首页为active的', function(){
            me.currPage = 1;
            me.pageStartFrom = 1;

            me.fixPage();
            me.makeHtml();

            expect(me.html.leftEndBtn.hasClass(me.classBtnActive)).toBe(true);
            expect(me.html.prevBtn.hasClass(me.classBtnActive)).toBe(true);
        });
        it('可以在最大页的时候，不生成rightNumBtn', function(){

            me.fixPage();
            me.currPage = me.maxPage;
            me.makeHtml();

            expect(me.html.rightNumBtn === '').toBe(true);
        });
        it('可以在最大页的时候，下一页和尾页是active的', function(){

            me.fixPage();
            me.currPage = me.maxPage;
            me.makeHtml();

            expect(me.html.rightEndBtn.hasClass(me.classBtnActive)).toBe(true);
            expect(me.html.nextBtn.hasClass(me.classBtnActive)).toBe(true);
        });
        it('可以在显示相应currPage的numBtn为active', function(){
            me.fixPage();
            me.makeHtml();

            expect(me.html.currBtn.hasClass(me.classBtnActive)).toBe(true);
        });
        it('在所有页，生成的leftNumBtn的数量和leftNum一致', function(){
            var startPage = 1,
                endPage = 20;

            me.pageStartFrom = startPage;
            for (startPage; startPage <= endPage; startPage++) {
                me.currPage = startPage;

                // 不隐藏的时候
                me.maxPageToTriggerHide = 30;
                me.maxNumBtnShow = 10;
                me.fixPage();
                me.makeHtml();
                expect(me.html.leftNumBtn.length === me.leftNum).toBe(true);

                // 可以隐藏，但是能全部显示
                me.maxPageToTriggerHide = 5;
                me.maxNumBtnShow = 20;
                me.fixPage();
                me.makeHtml();
                expect(me.html.leftNumBtn.length === me.leftNum).toBe(true);

                // 可以隐藏，部分显示
                me.maxPageToTriggerHide = 5;
                me.maxNumBtnShow = 5;
                me.fixPage();
                me.makeHtml();
                expect(me.html.leftNumBtn.length === me.leftNum).toBe(true);

            }

        });

        it('在所有页，生成的rightNumBtn的数量和rightNum一致', function(){
            var startPage = 1,
                endPage = 20;

            me.pageStartFrom = startPage;
            for (startPage; startPage <= endPage; startPage++) {

                me.currPage = startPage;

                if (me.currPage === 5) {
                    // debugger
                }

                // 不隐藏的时候
                me.maxPageToTriggerHide = 30;
                me.maxNumBtnShow = 10;
                me.fixPage();
                me.makeHtml();
                expect(me.html.rightNumBtn.length === me.rightNum).toBe(true);

                // 可以隐藏，但是能全部显示
                me.maxPageToTriggerHide = 5;
                me.maxNumBtnShow = 20;
                me.fixPage();
                me.makeHtml();
                expect(me.html.rightNumBtn.length === me.rightNum).toBe(true);

                // 可以隐藏，部分显示
                me.maxPageToTriggerHide = 5;
                me.maxNumBtnShow = 5;
                me.fixPage();
                me.makeHtml();
                expect(me.html.rightNumBtn.length === me.rightNum).toBe(true);

            }
        });

        it('在所有numBtn中，dataValueName对应的值和展示的值相同', function(){
            var $parDom = $('<div></div>');

            me.init({
                $parDom: $parDom
            });

            me.fixPage();
            me.makeHtml();
            me.$parDom.html(me.sort());
            me.$parDom.find('[data-'+me.dataValueName+']').each(function(i,n){
                var curr = $(n);
                expect(curr.data(me.dataValueName) === parseInt(curr.text(), 10)).toBe(true);
            });
        });

        it('以currBtn为起点,向左右延伸的numBtn的值都是连续的', function(){
            var $parDom = $('<div></div>'),
                numBtns,
                currPage,
                prevValue,
                i,
                j;

            me.init({
                $parDom: $parDom
            });

            me.fixPage();
            me.makeHtml();
            me.$parDom.html(me.sort());


            for (j = me.pageStartFrom; j <= me.maxPage; j++) {
                me.showPage(j);
                numBtns = me.$parDom.find('[data-'+me.dataValueName+']');

                console.log('############ 在第'+j+'页############');

                prevValue = j;

                // 向右延伸
                for (i = numBtns.index(numBtns.filter('.'+me.classBtnActive))+1; i < numBtns.length; i++ ) {
                    console.log('右',i, parseInt(numBtns.eq(i).text(), 10)-1, prevValue);
                    expect(parseInt(numBtns.eq(i).text(), 10)-1 === prevValue).toBe(true);
                    prevValue = parseInt(numBtns.eq(i).text(), 10);
                }

                // 向左延伸
                prevValue = j;
                for (i = numBtns.index(numBtns.filter('.'+me.classBtnActive))-1; i >= 0; i-- ) {
                    console.log('左',i, parseInt(numBtns.eq(i).text(), 10)+1, prevValue);
                    expect(parseInt(numBtns.eq(i).text(), 10)+1 === prevValue).toBe(true);
                    prevValue = parseInt(numBtns.eq(i).text(), 10);
                }

            }
        });

    });

    describe('sort', function(){
        var me,
            $parDom = $('<div></div>');
        beforeEach(function(){
            me = new Paging();
            me.init({
                $parDom: $parDom
            });
        });
        it('可以根据提供的排序展示对应顺序的翻页', function(){
            me.sortConf = 'prevBtn|nextBtn';
            me.fixPage();
            me.makeHtml();
            me.$parDom.html(me.sort());

            expect(me.$parDom.children().length).toBe(2);
            expect(me.$parDom.children().eq(0).data(me.dataRoleName)).toBe(me.data.prevDataValue);
            expect(me.$parDom.children().eq(1).data(me.dataRoleName)).toBe(me.data.nextDataValue);
        });
    });

    describe('function btn', function(){
        var me,
            $parDom = $('<div></div>');
        beforeEach(function(){
            me = new Paging();
            me.init({
                $parDom: $parDom
            });
            me.totalPage = 20;
            me.pageStartFrom = 1;
        });
        it('可以设定指定的页高亮', function(){
            var i = me.pageStartFrom;


            for (i; i <= me.totalPage; i++) {
                me.showPage(i);
                expect(me.currPage).toBe(i);
            }

        });
        it('可以用上一页来使得页码减少, 在到达最小值时不再变动', function(){
            var i = 0;
            me.currPage = me.pageStartFrom + me.totalPage - 1;
            for (i = me.currPage; i >= me.pageStartFrom; i) {
                me.goPrev();
                // if (i === 0) {
                //     debugger
                // }
                i--;
                if (i === me.pageStartFrom - 1){
                    // 此处，意思是在到达初始页的时候，继续上一页了
                    // 此时currPage应该还是最小值而不是跟着变小
                    expect(me.currPage > i).toBe(true);
                } else {
                    expect(me.currPage).toBe(i);
                }
            }
        });
        it('可以用下一页来使得页码增加, 在到达最大值时不再变动', function(){
            var i = 0,
                maxPage = me.pageStartFrom+me.totalPage - 1;
            me.currPage = me.pageStartFrom;
            for (i = me.currPage; i <= maxPage; i) {
                me.goNext();
                i++;
                if (i === maxPage+1){
                    // 此处表明到达最后一页之后继续下一页
                    // 此时currPage应该还是最大值而不是跟着变大
                    expect(me.currPage < i).toBe(true);
                } else {
                    expect(me.currPage).toBe(i);
                }
            }
        });
        it('可以使用首页来使得页码设定为pageStartFrom', function(){

            var i,
                maxPage = me.pageStartFrom + me.totalPage - 1;
            for (i = me.pageStartFrom; i <= maxPage; i++) {
                me.goLeftEnd();
                expect(me.currPage).toBe(me.pageStartFrom);
            }

        });
        it('可以使用尾页来使得页码设定为maxPage', function(){

            var i,
                maxPage = me.pageStartFrom + me.totalPage - 1;
            for (i = me.pageStartFrom; i <= maxPage; i++) {
                me.goRightEnd();
                expect(me.currPage).toBe(maxPage);
            }

        });
    });
});


});
