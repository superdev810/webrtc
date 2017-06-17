var autoText;
var isDocumentScrollable = false;
var isNew = false;

function init_custom_toolbar(){
    var e = {selection: "pointer",stroke: "stroke",line: "line",rect: "rectangle",roundRect: "roundrect",circle: "ellipse",fill: "fill",eraser: "eraser",text: "text",triangle: "triangle",pentagon: "pentagon",hexagon: "hexagon",none: "none"}
        , strokeWidths = {thickness1: 1, thickness2: 3, thickness3: 5, thickness4: 7}
        , gridTypes = {grid1: 'none', grid2: 'large', grid3: 'small'};

    autoText = $('#auto-text');
    autoText.autoGrowInput({
        maxWidth: 300,
        minWidth: 30,
        comfortZone: 1
    });
    autoText.blur(function(){
        autoText.css('visibility', 'hidden');
    });

    $('#wtool-color').colorPicker({
        customBG: '#fff',
        animationSpeed: 150,
        GPU: true,
        doRender: false,
        opacity: false,
        cssAddon: '.cp-color-picker{z-index: 99}',
        buildCallback: function($elm){
            this.color.setColor(whiteBoard.painter.activeColor);
            this.render();
        },
        renderCallback: function($elm, toggled){
            var colorValue = this.color.colors.HEX;
            whiteBoard.setActiveColor('#' + colorValue);
        }
    });

    $('[id^="wtool-"]').on('click', function(){
        var toolKey = $(this).attr('id').split('-')[1];
        switch (toolKey){
            case 'thickness4':
            case 'thickness3':
            case 'thickness2':
            case 'thickness1':
                whiteBoard.setActiveThickness(toolKey);
                break;
            case 'stroke':
            case 'selection':
            case 'eraser':
            case 'line':
            case 'rect':
            case 'triangle':
            case 'pentagon':
            case 'circle':
            case 'roundrect':
            case 'text':
                whiteBoard.startTool(e[toolKey]);
                break;
            case 'grid1':
            case 'grid2':
            case 'grid3':
                whiteBoard.grid(gridTypes[toolKey]);
                break;
            case 'rmsel':
                whiteBoard.removeSelection();
                break;
            case 'rmall':
                whiteBoard.removeAll();
                break;
            case 'cut':
                whiteBoard.cut();
                break;
            case 'copy':
                whiteBoard.copy();
                break;
            case 'paste':
                whiteBoard.paste();
                break;
            case 'browse':
                if (myPresenterFlag && currentPanel == DOCUMENT_PANEL){
                    $('#canvas-container').css('visibility', 'hidden');
                    $('#canvas-toolbar').css('visibility', 'hidden');
                    isDocumentScrollable = true;
                }
                break;
        }
        //if (myPresenterFlag && currentPanel == DOCUMENT_PANEL && toolKey != 'browse' && isDocumentScrollable){
            $('#canvas-container').css('visibility', 'visible');
            $('#canvas-toolbar').css('visibility', 'visible');
            isDocumentScrollable = false;
        //    whiteContainer.focus();
        //}
        if (toolKey == 'rmsel' || toolKey == 'rmall')
            isNew = true;
        else
            isNew = false;
        $(this).addClass('active');
    });
}
