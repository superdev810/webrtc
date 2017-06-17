define("selectionset", [], function() {
  var e = 0, t = function(t, n, r, i) {
    this.path = t, this.segment = n, this.type = r, this.id = i || ++e
  };
  t.prototype = {};
  var n = function() {
    this.items = {}
  };
  return n.prototype = {add: function(e) {
    if (e.id in this.items)
      return;
    this.items[e.id] = e, e.path && (e.path.selected = !0)
  },remove: function(e) {
    this.items[e] && (this.items[e].path && (this.items[e].path.selected = !1), delete this.items[e])
  },addPath: function(e) {
    var n = new t(e, null, null, "path:" + e.id);
    this.add(n)
  },removePath: function(e) {
    this.remove("path:" + e.id)
  },removeAll: function() {
    var e;
    for (e in this.items)
      this.items[e].path && (this.items[e].path.selected = !1);
    this.items = {}
  },empty: function() {
    return Object.keys(this.items).length === 0
  }}, {createItem: function(e, n, r) {
    return new t(e, n, r, "path:" + e.id)
  },createSelectionSet: function() {
    return new n
  }}
}), define("util", [], function() {
  var e = {hello: function() {
    return "Whitboard"
  },uniqueID: function() {
    return Math.random().toString(36).substr(2, 9)
  }};
  return e
}), define("document", ["selectionset", "util"], function(e, t) {
  var n = function(e, n) {
    this.path = e, this.key = n || t.uniqueID()
  };
  n.prototype = {toJsonObject: function() {
    return {key: this.key,path: this.path.exportJSON({asString: !0,precision: 5})}
  },fromJsonObject: function(e) {
    this.key = e.key, this.path = new paper.Path, this.path.importJSON(e.path)
  },serializePath: function() {
    return this.path.exportJSON({asString: !0,precision: 5})
  },deserializePath: function(e) {
    this.path && this.path.remove(), this.path = new paper.Path, this.path.importJSON(e)
  }};
  var txt = function(e, n) {
    this.text = e, this.key = n || t.uniqueID()
  };
  txt.prototype = {toJsonObject: function() {
    return {key: this.key,text: this.text.exportJSON({asString: !0,precision: 5})}
  },fromJsonObject: function(e) {
    this.key = e.key, this.text = new paper.PointText, this.text.importJSON(e.text)
  },serializePath: function() {
    return this.text.exportJSON({asString: !0,precision: 5})
  },deserializePath: function(e) {
    this.text && this.text.remove(), this.text = new paper.PointText, this.text.importJSON(e)
  }};
  var im = function(e, n) {
    this.raster = e, this.key = n || t.uniqueID()
  };
  im.prototype = {toJsonObject: function() {
    return {key: this.key,raster: this.raster.exportJSON({asString: !0,precision: 5})}
  },fromJsonObject: function(e) {
    this.key = e.key, this.raster = new paper.Raster, this.raster.importJSON(e.raster)
  },serializePath: function() {
    return this.raster.exportJSON({asString: !0,precision: 5})
  },deserializePath: function(e) {
    this.raster && this.raster.remove(), this.raster = new paper.Raster, this.raster.importJSON(e)
  }};
  var r = function(e) {
    this.doc = e, this.shapes = {}, this.addedShapes = [], this.removedShapes = [], this.updatedShapes = []
  };
  r.prototype = {addPath: function(e) {
    if (!this.existPath(e)) {
      var t = this.addShapeItem(new n(e));
      return t
    }
  },removePath: function(e) {
    var t;
    this.traverseShapes(!1, function(n) {
      if (n.path === e)
        return t = n, !0
      if (n.text === e)
        return t = n, !0
      if (n.raster === e)
        return t = n, !0
    }), t && this.removeShapeItem(t.key)
  },updatePath: function(e, t, n) {
    var r;
    this.traverseShapes(!1, function(t) {
      if (t.path === e)
        return r = t, !0
    }), r && this.updateShapeItem(r, t, n)
  }, addText: function(e) {
    if (!this.existText(e)) {
      var t = this.addShapeItem(new txt(e));
      return t
    }
  }, addImage: function(e) {
    if (!this.existText(e)) {
      var t = this.addShapeItem(new im(e));
      return t
    }
  },addShapeItem: function(e) {
    var t = e.key;
    if (!(t in this.shapes)) {
      this.shapes[t] = e;
      if (this.doc.isChanging) {
        var n = this.findInArray(e, this.removedShapes);
        n >= 0 && this.removedShapes.splice(n, 1), this.addedShapes.push(e)
      }
    }
  },updateShapeItem: function(e, t, n) {
    var r = e.key;
    r in this.shapes && (e.path[t] = n, this.doc.isChanging && this.updatedShapes.push({key: e.key,name: t,value: n}))
  },removeShapeItem: function(e) {
    if (e in this.shapes) {
      if (this.doc.isChanging) {
        var t = this.findInArray(this.shapes[e], this.addedShapes);
        t >= 0 && this.addedShapes.splice(t, 1), this.removedShapes.push(this.shapes[e])
      }
      if (this.shapes[e].path)
        this.shapes[e].path.remove();
      if (this.shapes[e].text)
        this.shapes[e].text.remove();
      if (this.shapes[e].raster)
        this.shapes[e].raster.remove();
      delete this.shapes[e]
    }
  },findInArray: function(e, t) {
    for (var n = 0, r = t.length; n < r; n++)
      if (e === t[n])
        return n;
    return -1
  },existPath: function(e) {
    var t = !1;
    this.traverseShapes(!1, function(n) {
      if (n.path === e)
        return t = !0, !0
    })
  },existText: function(e) {
    var t = !1;
    this.traverseShapes(!1, function(n) {
      if (n.text === e)
        return t = !0, !0
    })
  },existShapeItem: function(e) {
    var t;
    e instanceof n ? t = e.key : t = e;
    var r = !1;
    return this.traverseShapes(!1, function(e) {
      if (e.key === t)
        return r = !0, !0
    }), r
  },traverseShapes: function(e, t) {
    var n = Object.keys(this.shapes), r, i = !1;
    for (var s = 0, o = n.length; !i && s < o; s++)
      e ? r = n[o - s - 1] : r = n[s], i = t(this.shapes[r])
  },toJsonObject: function() {
    var e = {};
    return e.shapes = [], this.traverseShapes(!1, function(t) {
      t instanceof n && e.shapes.push(t.toJsonObject())
    }), e
  },fromJsonObject: function(e) {
    if (!e || !e.shapes)
      return;
    var t = e.shapes;
    for (var r = 0, i = t.length; r < i; r++) {
      var s = null;
      if (t[r].text)
        s = new txt;
      else if (t[r].path)
        s = new n;
      else
        s = new im;
      s.fromJsonObject(t[r]), this.addShapeItem(s)
    }
  }};
  var i = function(t) {
    this.application = t, this.shapeRoot = new r(this), this.ss = new e.createSelectionSet, this.isChanging = !1, this.sharedDocument = null, this.shapeKeys = null
  };
  return i.prototype = {beginChange: function() {
    console.log("Document::beginChange"), this.shapeRoot.addedShapes.length = 0, this.shapeRoot.removedShapes.length = 0, this.shapeRoot.updatedShapes.length = 0, this.shapeKeys = {};
    for (k in this.shapeRoot.shapes)
      this.shapeKeys[k] = !0;
    this.isChanging = !0
  },endChange: function() {
    console.log("Document::endChange");
    for (var e = this.shapeRoot.addedShapes.length, t = e - 1; t >= 0; t--) {
      var n = this.shapeRoot.addedShapes[t].key;
      this.shapeKeys[n] && this.shapeRoot.addedShapes.splice(t, 1)
    }
    for (var e = this.shapeRoot.removedShapes.length, t = e - 1; t >= 0; t--) {
      var n = this.shapeRoot.removedShapes[t].key;
      this.shapeKeys[n] || this.shapeRoot.removedShapes.splice(t, 1)
    }
    this.pushSharedDeltaState(), this.isChanging = !1
  },initSharedDocument: function(e) {
    var t = this;
    if (!e || e === "")
      e = "unknown";
    sharejs.open(e, "json", function(e, n) {
      if (e) {
        console.error("Failed to setup sharejs connection: " + e);
        return
      }
      t.sharedDocument = n, t.sharedDocument.on("change", function(e) {
        console.log("sharejs document changed: " + JSON.stringify(e)), t.pullSharedDeltaState(e)
      });
      t.sharedDocument.created ? t.saveSharedDocument() : t.loadSharedDocument();
    })
  },saveSharedDocument: function() {
    var e = this.shapeRoot.toJsonObject();
    this.sharedDocument.submitOp([{p: [],od: null,oi: e}])
  },loadSharedDocument: function() {
    var e = this, t = e.sharedDocument.snapshot;
    e.shapeRoot.fromJsonObject(t), paper.view.update()
  },findInSnapshot: function(e, t) {
    for (var n = 0, r = t.shapes.length; n < r; n++)
      if (t.shapes[n].key === e.key)
        return n;
    return -1
  },pushSharedDeltaState: function() {

    //e.shapeRoot.addedShapes.forEach(function(t) {
    //    r = {p: ["shapes", n++],li: t.toJsonObject()}, e.sharedDocument.submitOp([r])
    //}), e.shapeRoot.removedShapes.forEach(function(n) {
    //    i = e.findInSnapshot(n, t), i >= 0 && (r = {p: ["shapes", i],ld: n.toJsonObject()}, e.sharedDocument.submitOp([r]))
    //}), e.shapeRoot.updatedShapes.forEach(function(n) {
    //    i = e.findInSnapshot(n, t);
    //    if (i >= 0 && n.key in e.shapeRoot.shapes) {
    //        var s = e.shapeRoot.shapes[n.key];
    //        r = {p: ["shapes", i, "path"],od: null,oi: s.serializePath()}, e.sharedDocument.submitOp([r])
    //    }
    //})
    var e = this;
    if (!e.sharedDocument)
      return;
    var t = e.sharedDocument.snapshot, n = t.shapes.length, r, i;
    e.shapeRoot.addedShapes.forEach(function(t) {
      var li_obj = t.toJsonObject();
      var path_obj = li_obj.path;
      if (path_obj){
        var parse_path = JSON.parse(path_obj);
        var check_obj = parse_path[1];
        if (!check_obj.strokeWidth) {
          check_obj.strokeWidth = 1;
          parse_path[1] = check_obj;
          path_obj = JSON.stringify(parse_path);
          li_obj.path = path_obj;
        }
      } else if (li_obj.text){
        var parse_txt = JSON.parse(li_obj.text);
        var check_txt_obj = parse_txt[1];
        //if (!check_txt_obj.strokeWidth){
        check_txt_obj.strokeWidth = 1;
        parse_txt[1] = check_txt_obj;
        li_obj.text = JSON.stringify(parse_txt);
        //}
      }
      console.log("****** push share delta state *******");
      r = {p: ["shapes", n++],li: li_obj}, e.sharedDocument.submitOp([r])
    }), e.shapeRoot.removedShapes.forEach(function(n) {
      i = e.findInSnapshot(n, t), i >= 0 && (r = {p: ["shapes", i],ld: n.toJsonObject()}, e.sharedDocument.submitOp([r]))
    }), e.shapeRoot.updatedShapes.forEach(function(n) {
      i = e.findInSnapshot(n, t);
      if (i >= 0 && n.key in e.shapeRoot.shapes) {
        var s = e.shapeRoot.shapes[n.key];
        r = {p: ["shapes", i, "path"],od: null,oi: s.serializePath()}, e.sharedDocument.submitOp([r])
      }
    })
  },pullSharedDeltaState: function(e) {
    console.log("****** pull share delta state *******");
    var t = this;
    if (!t.sharedDocument || !e || e.length === 0)
      return;
    var r = !1;
    for (var i = 0, s = e.length; i < s; i++) {
      var o = e[i].p, u;
      if (o.length === 2) {
        var a = e[i].li, f = e[i].ld;
        if (a && !t.shapeRoot.existShapeItem(a.key)) {
          var l = null;
          if (a.text)
            l = new txt;
          else if (a.path)
            l = new n;
          else
            l = new im;
          l.fromJsonObject(a), t.shapeRoot.addShapeItem(l), r = !0
          console.log("-----------------------------------");
        }
        f && t.shapeRoot.existShapeItem(f.key) && (t.shapeRoot.removeShapeItem(f.key), r = !0)
      } else if (o.length === 3) {
        var c = e[i].oi, h;
        if (c && (h = t.sharedDocument.snapshot.shapes[o[1]])) {
          var p = t.shapeRoot.shapes[h.key];
          p && (p.deserializePath(c), r = !0)
        }
      }
    }
    r && paper.view.update();
  },createShapeItem: function(e) {
    return new n(e)
  },createTextItem: function(e) {
    return new txt(e)
  },createImageItem: function(e) {
    return new im(e)
  }}, {createDocument: function(e) {
    return new i(e)
  },createShapeItem: function(e) {	// don't remove. not same above
    return new n(e)
  }}
}), define("painter", [], function() {
  var e = {Pointer: "pointer",Stroke: "stroke",Line: "line",Rectangle: "rectangle",RoundRect: "roundrect",Ellipse: "ellipse",Fill: "fill",Eraser: "eraser",Text: "text",Triangle: "triangle",Pentagon: "pentagon",Hexagon: "hexagon",None: "none"}
    , strokeColors = {colorblack: "#000000", colorblue: "#009ae7", colorred: "#ef1c21", colorgreen: "#4aae39", colororange: "#ff9200", colorgray: "#9c9a9c", colorpurple: "#632c94"}
    , strokeWidths = {thickness1: 1, thickness2: 3, thickness3: 5, thickness4: 7}
    , t = function(t) {
    this.application = t, this.doc = t.doc, this.ss = this.doc.ss, this.canvas = null, this.clipbrd = []
      , this.backgrd = null, this.backgrd_status = 'none', this.old_point = {x:-1,y:-1}
      , this.tools = {}, this.activeTool = e.None, this.activeColorTool = 'colorblack', this.activeThicknessTool = 'thickness1'
      , this.defaultStyle = {strokeColor: strokeColors.colorblack, strokeWidth: strokeWidths.thickness1}
      , this.activePath = null, this.startPoint = null, this.eatMouseUp = !1, this.maxRoundRectRadius = 10
      , this.activeColor = strokeColors.colorblack, this.hitOptions = {segments: !0,stroke: !0,fill: !0,tolerance: 5}
      , this.undoPaths = [], this.redoPaths = []
  };
  var prevPoint;
  return t.prototype = {
    init: function(e, b) {
      console.log("Painter::init")
        , this.canvas = e
        , this.backgrd = b
        , paper.setup(this.canvas)
        , this.initToolbar()
        , paper.project.currentStyle = $.extend({}, this.defaultStyle)
    },initToolbar: function() {
      console.log("Application::initToolbar()");
      var e = this;
      e.initTools();
      var t = $("#canvas-main").offset();
      //$("#canvas-toolbar").css({top: t.top,left: t.left}),
      $("#canvas-toolbar").css("visibility", "visible")
    },initTools: function() {
      var t, n = this, r = $("#canvas-toolbar"), i = function(e, t) {
        if (e == "undo" || e == "redo" || e == "cut" || e == "copy" || e == "paste") {
          var i = '<div id="tb-' + e + '" class="toolbaritem img-' + e + '-32x32-disable"></div>';
          r.append(i);
          var s = $("#tb-" + e);
          t !== undefined && typeof t == "function" && s.click(function() {
            t()
          })
        } else {
          if (e == "open") {
            var i = '<input id="tb-fileopen" style="display: none" type="file" accept="text/csv">'
            r.append(i);
            $("#tb-fileopen").change(function() {
              var file = $('#tb-fileopen')[0].files[0];
              if (file) {
                Papa.parse(file, {
                  config: {
                    delimiter: ";"
                  },
                  complete: function(result) {
                    n.removeAll();
                    var csvData = result.data;

                    var data = "";
                    for (var i = 0; i < csvData[0].length; i++) {
                      data += String.fromCharCode(csvData[0][i]);
                    }

                    data = JSON.parse(data);

                    if (data) {
                      n.doc.beginChange();
                      for (var shp in n.doc.shapeRoot.shapes) {
                        n.doc.shapeRoot.removeShapeItem(shp);
                      }
                      for (var i=0; i<data.length; i++){
                        var jsobj = data[i];
                        if (jsobj.path) {
                          var new_shape = n.doc.createShapeItem();
                          new_shape.path = new paper.Path;
                          new_shape.path.importJSON(jsobj.path);
                          n.doc.shapeRoot.addShapeItem(new_shape);
                        } else if (jsobj.raster) {
                          var new_shape = n.doc.createImageItem();
                          new_shape.raster = new paper.Raster;
                          new_shape.raster.importJSON(jsobj.raster);
                          n.doc.shapeRoot.addShapeItem(new_shape)
                        } else if (jsobj.text){

                          txt = new paper.PointText();
                          txt.importJSON(jsobj.text);
                          n.addText(txt);

                        }
                      }
                      n.doc.endChange();
                      n.undoPaths = [];
                      n.redoPaths = [];
                      n.changeRUToolbar();
                      paper.view.update();
                    }
                  }
                })
              }
            });
          } else if (e=="image") {
            var i = '<input id="inp-image" style="display: none" type="file" accept="image/*">'
            r.append(i);
            $("#inp-image").fileupload({
              dataType: 'json',
              autoUpload: true,
              singleFileUploads: true,
              url: "/room-api/share-files",
              formData: {
                shareType: "whiteboard"
              },
              done: function (e, data) {
                var imageObj = new Image();
                imageObj.onload = function () {
                  var img = new paper.Raster(imageObj, new paper.Point(imageObj.width / 2, imageObj.height / 2));
                  // var img = n.doc.createShapeItem();
                  n.doc.beginChange();
                  n.doc.shapeRoot.addImage(img);
                  n.doc.endChange();
                  paper.view.update();
                };
                console.log(data);
                imageObj.src = "uploads/" + data.result.files[0].name;
              }
            });
          }
          var i = '<div id="tb-' + e + '" class="toolbaritem img-' + e + '-32x32-normal"></div>';
          r.append(i);
          var s = $("#tb-" + e);
          s.hover(function() {
            n.changeToolbarItemState(e, "hover")
          }, function() {
            n.changeToolbarItemState(e, "normal")
          }), t !== undefined && typeof t == "function" && s.click(function() {
            t()
          })
        }
      }, s = function() {
        r.append('<div class="toolbarsep img-seperate-32x4-normal"></div>')
      }, o = function(t) {
        var r = new paper.Tool;
        n.tools[t] = r, r.onMouseDown = function(e) {
          var ne = e;
          if (n.activeTool != 'eraser' && n.activeTool != 'pointer')
            ne = n.changePoint(e);
          n.old_point.x = ne.point.x;
          n.old_point.y = ne.point.y;
          n.drawBegin(t, ne);

          if (n.activeTool == 'text') {
            n.drawEnd(t, ne);
          }
        }, r.onMouseDrag = function(e) {
          var ne = e;
          if (n.activeTool != 'eraser' && n.activeTool != 'pointer')
            ne = n.changePoint(e);
          if (n.old_point.x == ne.point.x && n.old_point.y == ne.point.y)
            return;
          n.old_point.x = ne.point.x;
          n.old_point.y = ne.point.y;
          n.drawMove(t, ne);
        }, r.onMouseUp = function(e) {
          var ne = n.changePoint(e);
          n.drawEnd(t, ne)
        }, t === e.Pointer && (r.onKeyDown = function(e) {
          e.key === "delete" && n.removeSelection()
        }, r.onKeyUp = function(e) {
        })
      };
      o(e.Pointer), o(e.Fill), o(e.Stroke), o(e.Rectangle), o(e.RoundRect), o(e.Ellipse), o(e.Line), o(e.Eraser), o(e.Triangle), o(e.Pentagon), o(e.Hexagon), o(e.Text),
        s(),
        i("new", function() {
          n.removeAll();
          //}), i("save", function() {
          //saveToDisk(n.canvas.toDataURL(), 'Drawing_' + Date.now());
        }), i("open", function() {
        $("#tb-fileopen").click();
      }), i("save", function() {
        // n.canvas.toDataURL()
        var base64_encode = function(value) {
          var result = "";
          for (var i = 0; i < value.length; i++) {
            var num = value.charCodeAt(i);
            result += num + ",";
          }
          result = result.substr(0,result.length - 1);
          return result;
        }
        var data = [];
        for (var shp in n.doc.shapeRoot.shapes){
          console.log(n.doc.shapeRoot.shapes[shp]);
          data.push(n.doc.shapeRoot.shapes[shp])
        }
        console.log(data);
        data = base64_encode(JSON.stringify(data));
        var csvContent = "data:text/csv;charset=utf-8,";
        csvContent += data;
        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "my_data.csv");
        document.body.appendChild(link); // Required for FF
        link.click();
        link.remove();
      }), s(), i("undo", function() {
        n.undo();
      }), i("redo", function() {
        n.redo();
      }), s(), i("pointer", function() {
        n.startTool(e.Pointer);
      }), i("remove", function() {
        n.removeSelection();
      }), s(), i("cut", function() {
        n.cut();
      }), i("copy", function() {
        n.copy();
      }), i("paste", function() {
        n.paste();
      }), s(), i("stroke", function() {
        n.startTool(e.Stroke);
      }), i("line", function() {
        n.startTool(e.Line);
      }), i("rectangle", function() {
        n.startTool(e.Rectangle);
      }), i("roundrect", function() {
        n.startTool(e.RoundRect);
      }), i("ellipse", function() {
        n.startTool(e.Ellipse);
      }), i("triangle", function() {
        n.startTool(e.Triangle);
      }), i("pentagon", function() {
        n.startTool(e.Pentagon);
      }), i("hexagon", function() {
        n.startTool(e.Hexagon);
      }), s(), i("text", function() {
        n.startTool(e.Text);
      }), s(), i("fill", function() {
        n.startTool(e.Fill);
      }), s(), i("eraser", function() {
        n.startTool(e.Eraser);
        /*}), s(), i("zoomin", function() {
         console.log("TODO: zoomin");
         }), i("zoomout", function() {
         console.log("TODO: zoomout")
         }), i("ruler", function() {
         console.log("TODO: ruler")*/
      }), s(), i("colorblack", function() {
        n.setActiveColor('colorblack');
      }), i("colorblue", function() {
        n.setActiveColor('colorblue');
      }), i("colorred", function() {
        n.setActiveColor('colorred');
      }), i("colorgreen", function() {
        n.setActiveColor('colorgreen');
      }), i("colororange", function() {
        n.setActiveColor('colororange');
      }), i("colorgray", function() {
        n.setActiveColor('colorgray');
      }), i("colorpurple", function() {
        n.setActiveColor('colorpurple');
      }), s(), i("thickness1", function() {
        n.setActiveThicknessTool('thickness1');
      }), i("thickness2", function() {
        n.setActiveThicknessTool('thickness2');
      }), i("thickness3", function() {
        n.setActiveThicknessTool('thickness3');
      }), i("thickness4", function() {
        n.setActiveThicknessTool('thickness4');
      }), s(), i("grid", function() {
        n.grid();
      }), s(), i("image", function() {
        n.image();
      })
        , this.startTool(e.Stroke)
        , this.setActiveColor('colorblack')
        , this.setActiveThicknessTool('thickness1')
    },changeToolbarItemState: function(e, t, n) {
      var r = $("#tb-" + e);
      if (!r)
        return;
      var i = "img-" + e + "-32x32-normal", s = "img-" + e + "-32x32-active", o = "img-" + e + "-32x32-hover", u = "img-" + e + "-32x32-" + t;
      if (!n && r.hasClass(s))
        return;
      r.hasClass(i) && i !== u && r.removeClass(i), r.hasClass(s) && s !== u && r.removeClass(s), r.hasClass(o) && o !== u && r.removeClass(o), r.hasClass(u) || r.addClass(u)
    },startTool: function(t) {
      this.activeTool !== e.None && this.endTool(), t == e.Fill && this.deselectPath(), this.tools[t].activate(), this.activeTool = t, this.changeToolbarItemState(t, "active")
      this.setCursor(t);
    },endTool: function() {
      this.changeToolbarItemState(this.activeTool, "normal", !0), this.activeTool = e.None
    },addToolBarItem: function(e, t) {
      var n = $("#canvas-toolbar"), r = '<div id="tb-' + e + '" class="btn"><span class=></span></div>';
      n.append()
    },drawBegin: function(t, n) {
      console.log("drawBegin:" + t);
      var r = this;
      r.doc.beginChange(), r.activePath = null, r.startPoint = n.point.clone();
      if (t === e.Pointer) {
        r.deselectPath();
        var i = paper.project.hitTest(n.point, r.hitOptions);
        if (currentPanel == WEB_PAGE_PANEL){
          if (i){
            if (i.item.className == "Raster")
              r.deselectPath();
            else
              r.selectPath(i.item);
          } else {
            r.deselectPath();
          }
        } else {
          i ? r.selectPath(i.item) : r.deselectPath();
        }
        r.changeXCVToolbar();
      } else if (t === e.Eraser) {
        paper.project.currentStyle.strokeColor = '#FFFFFF';
        this.setActiveThicknessTool('thickness4');
      } else if (t === e.Text) {
        //insertText(n.prevPoint, function(){
        autoText.css({left: n.point.x, top: n.point.y - 10, visibility: 'visible', color: this.activeColor});
        autoText.focus();
        prevPoint = n.point;
        //autoText.blur(function);
        autoText.keypress(function(ke){
          if (ke.which == 13){
            autoText.css('visibility', 'hidden');
            //paper.view.focus();
            insertText(prevPoint);
          }
        });
        //});
        function insertText(prevPoint, cb){
          var inp_text = autoText.val();
          autoText.val('');
          autoText.trigger('autogrow');
          if (inp_text) {
            var txt;
            //n.point = prevPoint;
            if (prevPoint)
              txt = new paper.PointText(prevPoint);
            else
              txt = new paper.PointText(n.point);
            txt.fillColor = this.activeColor;
            txt.content = inp_text;
            txt.fontSize = 14;//10 + paper.project.currentStyle.strokeWidth * 3;
            txt.strokeWidth = 1;
            txt.leading = 10;
            r.addText(txt);

            r.doc.endChange(); // copied from drawEnd
            r.undoPaths.push(r.doc.shapeRoot.addedShapes[0]);
            r.removeRedoPaths();
            r.changeRUToolbar();

            paper.view.update();
          }
          if (cb)
            cb();
        }
      } else
        t === e.Fill && r.doc.shapeRoot.traverseShapes(!0, function(e) {
          if (e.path && e.path.closed && e.path.contains(n.point)) {
            var org_color = e.path.getFillColor() ? e.path.getFillColor().toCanvasStyle() : 'rgba(0,0,0,0)';

            r.undoPaths.push({type:'fill', obj: e, from: org_color, to: r.activeColor});
            r.removeRedoPaths();
            r.changeRUToolbar();
            return r.doc.shapeRoot.updateShapeItem(e, "fillColor", r.activeColor), !0
          }
        })
    },drawMove: function(t, n) {
      if (t == e.Text)
        return;
      console.log("drawMove:" + t);
      var r = this;
      switch (t) {
        case e.Pointer:
          for (var i in r.ss.items) {
            var s = r.ss.items[i].path;
            s.position = s.position.add(n.delta);
          }
          break;
        case e.Stroke:
        case e.Eraser:
          r.activePath || (r.activePath = r.addPath(), r.activePath.add(r.startPoint), r.activePath.add(n.point)), n.event.shiftKey ? r.activePath.lastSegment.point = n.point : r.activePath.add(n.point);
          break;
        case e.Line:
          r.activePath || (r.activePath = r.addPath(), r.activePath.add(r.startPoint), r.activePath.add(n.point)), r.activePath.lastSegment.point = n.point;
          break;
        case e.Rectangle:
          r.activePath = r.updatePath(r.activePath, paper.Path.Rectangle(r.startPoint, n.point));
          break;
        case e.RoundRect:
          var o = r.maxRoundRectRadius, u = new paper.Rectangle(r.startPoint, n.point), a = u.width > u.height ? u.height : u.width, o = a * .2;
          o > r.maxRoundRectRadius && (o = r.maxRoundRectRadius), r.activePath = r.updatePath(r.activePath, paper.Path.Rectangle(u, o));
          break;
        case e.Ellipse:
          r.activePath = r.updatePath(r.activePath, paper.Path.Ellipse(new paper.Rectangle(r.startPoint, n.point)));
          break;
        case e.Triangle:
          var shapePoints = r.getShapePoints(r.startPoint, n.point, 3);
          var path = new paper.Path();
          for (var i=0; i<=3; i++)
            path.add(shapePoints[i]);
          path.setClosed(true);
          r.activePath = r.updatePath(r.activePath, path);
          break;
        case e.Pentagon:
        case e.Hexagon:
          var pt_num = -1;
          if (t == e.Pentagon)
            pt_num = 5;
          else if (t == e.Hexagon)
            pt_num = 6;
          var shapePoints = r.getShapePoints(r.startPoint, n.point, pt_num);
          var path = new paper.Path();
          for (var i=0; i<=pt_num; i++)
            path.add(shapePoints[i]);
          path.setClosed(true);
          r.activePath = r.updatePath(r.activePath, path);
          break;
        default:
          break;
      }
    },drawEnd: function(t, n) {
      if (t == e.Text)
        return;
      console.log("drawEnd:" + t);
      var r = this;
      if (!r.activePath && t != e.Pointer) {
        r.doc.endChange();
        return;
      }
      switch (t) {
        case e.Pointer:
          if (this.comparePoint(n.point, r.startPoint))
            break;

          for (k in this.ss.items) {
            var selobj = this.ss.items[k].path;
            selobj.selected = false;
            var jsobj = selobj.exportJSON({asString: !0,precision: 5});
            var newobj = null;
            if (selobj instanceof paper.PointText) {
              newobj = this.doc.createTextItem(new paper.PointText);
              newobj.text.importJSON(jsobj);
              newobj.text.strokeWidth = 1;
              console.log("********* create text item *************");
              console.log(newobj);
            } else if (selobj instanceof paper.Path){
              newobj = this.doc.createShapeItem(new paper.Path);
              newobj.path.importJSON(jsobj);
            } else if (selobj instanceof paper.Raster){
              newobj = this.doc.createImageItem(new paper.Raster);
              newobj.raster.importJSON(jsobj);
            }
            this.doc.shapeRoot.addShapeItem(newobj);
            this.deletePath(selobj);
          }
          this.deselectPath();
          break;
        case e.Stroke:
          if (n.event.shiftKey) {
            r.activePath.lastSegment.remove();
            var i = r.activePath.firstSegment.point.add(n.point);
            i.x /= 2, i.y /= 2, r.activePath.add(i), r.activePath.add(n.point)
          } else {
            r.activePath.add(n.point);
            if (this.backgrd_status == 'none')
              r.activePath.simplify(10);
          }
          break;
        case e.Eraser:
          r.activePath.add(n.point);
          paper.project.currentStyle.strokeColor = this.activeColor;
          break;
        case e.Line:
          r.activePath.lastSegment.remove();
          var i = r.activePath.firstSegment.point.add(n.point);
          i.x /= 2, i.y /= 2, r.activePath.add(i), r.activePath.add(n.point);
          break;
        case e.Rectangle:
          r.activePath = r.updatePath(r.activePath, paper.Path.Rectangle(r.startPoint, n.point));
          break;
        case e.RoundRect:
          var s = r.maxRoundRectRadius, o = new paper.Rectangle(r.startPoint, n.point), u = o.width > o.height ? o.height : o.width, s = u * .2;
          s > r.maxRoundRectRadius && (s = r.maxRoundRectRadius), r.activePath = r.updatePath(r.activePath, paper.Path.Rectangle(o, s));
          break;
        case e.Ellipse:
          r.activePath = r.updatePath(r.activePath, paper.Path.Ellipse(new paper.Rectangle(r.startPoint, n.point)));
          break;
        default:
      }
      r.doc.endChange();

      r.undoPaths.push(r.doc.shapeRoot.addedShapes[0]);
      r.removeRedoPaths();
      r.changeRUToolbar();
      r.changeXCVToolbar();
    },addPath: function(e) {
      return e || (e = new paper.Path), this.doc.shapeRoot.addPath(e), e
    },deletePath: function(e) {
      if (!e)
        return;
      this.doc.shapeRoot.removePath(e)
    },updatePath: function(e, t) {
      return e && this.deletePath(e), this.addPath(t)
    },selectPath: function(e) {
      if (!e) {
        var t = this;
        this.doc.shapeRoot.traverseShapes(!1, function(e) {
          e.path && t.ss.addPath(e.path)
        })
      } else
        this.ss.addPath(e)
    },deselectPath: function(e) {
      e ? this.ss.removePath(e) : this.ss.removeAll()
    },addText: function(e) {
      return e || (e = new paper.PointText), this.doc.shapeRoot.addText(e), e
    },addImage: function(e) {
      return e || (e = new paper.Raster), this.doc.shapeRoot.addImage(e), e
    },removeSelection: function() {
      this.doc.beginChange();
      for (k in this.ss.items)
        this.deletePath(this.ss.items[k].path);
      this.deselectPath(), this.doc.endChange();
    },setActiveColor: function(cName) {
      this.changeToolbarItemState(this.activeColorTool, 'normal', !0);
      this.activeColor = strokeColors[cName], paper.project.currentStyle.strokeColor = strokeColors[cName];
      this.changeToolbarItemState(cName, 'active', !0);
      this.activeColorTool = cName;
    },setActiveThicknessTool: function(tName) {
      this.changeToolbarItemState(this.activeThicknessTool, 'normal', !0);
      paper.project.currentStyle.strokeWidth = strokeWidths[tName];
      this.changeToolbarItemState(tName, 'active', !0);
      this.activeThicknessTool = tName;
    },setActiveColorValue: function(cValue){
      this.activeColor = cValue;
      paper.project.currentStyle.strokeColor = cValue;
    },undo: function() {
      if (this.undoPaths.length <= 0)
        return;
      this.doc.beginChange();
      var last = this.undoPaths.pop();
      if (last.type == 'fill')
        this.doc.shapeRoot.updateShapeItem(last.obj, "fillColor", last.from);
      else
        this.doc.shapeRoot.removeShapeItem(last.key);
      this.doc.endChange();
      paper.view.update();
      this.redoPaths.push(last);
      this.changeRUToolbar();
    },redo: function() {
      if (this.redoPaths.length <= 0)
        return;
      var last = this.redoPaths.pop();
      if (last.type == 'fill') {
        this.doc.beginChange();
        this.doc.shapeRoot.updateShapeItem(last.obj, "fillColor", last.to);
        this.doc.endChange();
      } else {
        this.doc.beginChange();
        this.doc.shapeRoot.addShapeItem(last);
        this.doc.endChange();
        this.doc.beginChange();
        this.doc.shapeRoot.updateShapeItem(last, "strokeColor", last.path.getStrokeColor().toCanvasStyle());
        this.doc.endChange();
      }
      this.undoPaths.push(last);
      this.changeRUToolbar();
    },changeRUToolbar: function() {
      if (this.undoPaths.length)
        this.changeToolbarItemState("undo", "normal");
      else
        this.changeToolbarItemState("undo", "disable");
      if (this.redoPaths.length)
        this.changeToolbarItemState("redo", "normal");
      else
        this.changeToolbarItemState("redo", "disable");
    },changeXCVToolbar: function() {
      if (this.clipbrd.length)
        this.changeToolbarItemState("paste", "normal");
      else
        this.changeToolbarItemState("paste", "disable");

      var is_sel = false;
      for (k in this.ss.items) {
        is_sel = true;
        break;
      }
      if (is_sel) {
        this.changeToolbarItemState("cut", "normal");
        this.changeToolbarItemState("copy", "normal");
      } else {
        this.changeToolbarItemState("cut", "disable");
        this.changeToolbarItemState("copy", "disable");
      }
    },removeRedoPaths: function() {
      for (; this.redoPaths.length > 0;) {
        delete this.redoPaths.pop();
      }
    },setCursor: function(t) {
      switch (t) {
        case e.Ellipse:
        case e.Line:
        case e.Rectangle:
        case e.Rectangle:
        case e.RoundRect:
        case e.Triangle:
        case e.Pentagon:
        case e.Hexagon:
          $(this.canvas).css('cursor', 'crosshair');
          break;
        case e.Stroke:
          $(this.canvas).css('cursor', 'url(../img/pen.png), auto');
          break;
        case e.Fill:
          $(this.canvas).css('cursor', 'url(../img/paint.png), auto');
          break;
        case e.Eraser:
          $(this.canvas).css('cursor', 'url(../img/eraser.png), auto');
          break;
        case e.Text:
          $(this.canvas).css('cursor', 'text');
          break;
        default:
          $(this.canvas).css('cursor', 'default');
          break;
      }
    }, grid: function(backgrd_val) {
      if (backgrd_val){
        this.backgrd_status = backgrd_val;
        switch (this.backgrd_status) {
          case 'none':
            $(this.backgrd).css('background', '');
            break;
          case 'small':
            $(this.backgrd).css('background', 'url(/img/grid100_x.png) repeat transparent');
            break;
          case 'large':
            $(this.backgrd).css('background', 'url(/img/grid100_4_x.png) repeat transparent');
            break;
          default:
            break;
        }
      } else {
        switch (this.backgrd_status) {
          case 'none':
            this.backgrd_status = 'small';
            $(this.backgrd).css('background', 'url(/img/grid100_x.png) repeat transparent');
            break;
          case 'small':
            this.backgrd_status = 'large';
            $(this.backgrd).css('background', 'url(/img/grid100_4_x.png) repeat transparent');
            break;
          case 'large':
            this.backgrd_status = 'none';
            $(this.backgrd).css('background', '');
            break;
          default:
            break;
        }
        grid_changed(this.backgrd_status);
      }
    }, changePoint: function(e) {
      if (this.backgrd_status == 'none' || !e)
        return e;

      var new_point = e.clone();
      if (e.delta)
        new_point.delta = e.delta.clone();
      if (e.point)
        new_point.point = e.point.clone();
      new_point.event = e.event;

      var interval = 10;
      if (this.backgrd_status == 'large')
        interval = 25;
      var smaller_max_x = Math.floor(new_point.point.x / interval) * interval;
      var smaller_max_y = Math.floor(new_point.point.y / interval) * interval;
      if (new_point.point.x - smaller_max_x < (smaller_max_x + interval) - new_point.point.x)
        new_point.point.x = smaller_max_x;
      else
        new_point.point.x = smaller_max_x + interval;

      if (new_point.point.y - smaller_max_y < (smaller_max_y + interval) - new_point.point.y)
        new_point.point.y = smaller_max_y;
      else
        new_point.point.y = smaller_max_y + interval;

      return new_point;
    }, cut: function(e) {
      this.clipbrd = [];
      this.doc.beginChange();
      for (k in this.ss.items) {
        var selpath = this.ss.items[k].path;
        selpath.selected = false;
        this.clipbrd.push(selpath);

        this.deletePath(selpath);
      }
      this.doc.endChange();
      paper.view.update();
      this.deselectPath();
      this.changeXCVToolbar();
    }, copy: function(e) {
      this.clipbrd = [];
      for (k in this.ss.items) {
        var selpath = this.ss.items[k].path;
        selpath.selected = false;
        this.clipbrd.push(selpath);
      }
      this.deselectPath();
      this.changeXCVToolbar();
    }, paste: function(e) {
      if (this.clipbrd.length <= 0)
        return;

      this.doc.beginChange();
      for (var idx=0; idx<this.clipbrd.length; idx++) {
        var toaddpath = this.clipbrd[idx];
        var jsobj = toaddpath.exportJSON({asString: !0,precision: 5});

        if (toaddpath.className == "Path") {
          var new_shape = this.doc.createShapeItem();
          new_shape.path = new paper.Path;
          new_shape.path.importJSON(jsobj);
          new_shape.path.position.x += 15 * Math.random() + 3;
          new_shape.path.position.y += 15 * Math.random() + 3;
          this.doc.shapeRoot.addShapeItem(new_shape);
          paper.view.update();
        } else if(toaddpath.className == "PointText"){
          txt = new paper.PointText();
          txt.importJSON(jsobj);
          txt.matrix.tx += 15;
          txt.matrix.ty += 15;
          this.addText(txt);
          paper.view.update();
        } else if (toaddpath.className == "Raster"){
          var imageObj = new Image();
          var r = this;
          imageObj.onload = function () {
            var img = new paper.Raster(imageObj, new paper.Point(toaddpath._matrix._tx + 15, toaddpath._matrix._ty + 15));
            r.addImage(img);
            paper.view.update();
          };
          imageObj.src = toaddpath._image.currentSrc;
        }
      }
      this.doc.endChange();
    }, comparePoint: function(pa, pb) {
      if (Math.abs(pa.x - pb.x) <= this.hitOptions.tolerance && Math.abs(pa.x - pb.x) <= this.hitOptions.tolerance)
        return true;
      else
        return false;
    }, image: function() {
      $('#inp-image').click();
      /*var r = this;

       $('#inp-image').click();
       $('#inp-image').unbind('change');
       $('#inp-image').bind('change', function (e) {
       var files = e.target.files;
       if (!files || files.length === 0) {
       return;
       }
       var file = files[0];
       if (file.size > 15728640) {
       alert('File size can not be over 15MByte.');
       return;
       }
       var reader = new FileReader();
       reader.addEventListener('loadend', function () {
       var realname = (new Date().getTime()) + '_' + file.name;
       var xhr = new XMLHttpRequest();
       xhr.open('POST', '/postimage', true);
       xhr.setRequestHeader("Content-Type", "application/octet-stream");
       xhr.setRequestHeader("x-file-name", realname);
       xhr.send(file);
       xhr.onreadystatechange = function () {
       if (xhr.readyState == 4 && xhr.status == 200) {
       var imageObj = new Image();
       imageObj.onload = function () {
       var img = new paper.Raster(imageObj, new paper.Point(imageObj.width / 2, imageObj.height / 2));

       r.doc.beginChange();
       r.addImage(img);
       r.doc.endChange();
       paper.view.update();
       };
       imageObj.src = '/upload/' + realname;
       }
       }
       }, false);
       reader.readAsBinaryString(file);
       });*/
    }, insertImageFromUrl: function(url){
      var imageObj = new Image();
      var r = this;
      imageObj.onload = function () {
        var img = new paper.Raster(imageObj, new paper.Point(imageObj.width/2, imageObj.height/2));

        r.doc.beginChange();
        r.addImage(img);
        r.doc.endChange();
        paper.view.update();

        //var img_width = imageObj.width ;//> 2000 ? imageObj.width : 2000;
        //var img_height = imageObj.height; //> 2000 ? imageObj.height : 2000;
        //$('#canvas-main').css({width: img_width, height: img_height});
        //$('#canvas-back').css({width: img_width, height: img_height});
      };
      imageObj.src = url;
    }, getShapePoints: function(startPoint, endPoint, number) {
      var shapePoints = [];
      if (number == 3) {
        shapePoints.push(new paper.Point((startPoint.x + endPoint.x) / 2, startPoint.y));
        shapePoints.push(new paper.Point(startPoint.x, endPoint.y));
        shapePoints.push(new paper.Point(endPoint.x, endPoint.y));
        shapePoints.push(new paper.Point((startPoint.x + endPoint.x) / 2, startPoint.y));
      } else {
        var mp = new paper.Point((startPoint.x + endPoint.x) / 2, (startPoint.y + endPoint.y) / 2);
        var sr = Math.min(Math.abs(startPoint.x - endPoint.x), Math.abs(startPoint.y - endPoint.y));
        for (var ag = -Math.PI/2; ag <Math.PI * 1.6; ag+=2*Math.PI/number) {
          console.log(ag);
          shapePoints.push(new paper.Point(mp.x + sr * Math.cos(ag), mp.y + sr * Math.sin(ag)));
        }
      }

      return shapePoints;
    }, removeAll: function(cb){
      for (var shp in this.doc.shapeRoot.shapes) {
        this.doc.beginChange();
        var s = this.doc.shapeRoot.shapes[shp];
        if (s.path)
          this.deletePath(s.path);
        else if(s.raster)
          this.deletePath(s.raster);
        else if(s.text)
          this.deletePath(s.text);
        this.doc.endChange();
        //this.doc.shapeRoot.removeShapeItem(shp);
      }
      this.undoPaths = [];
      this.redoPaths = [];
      this.changeRUToolbar();
      this.changeXCVToolbar();
      paper.view.update();
      if (cb)
        cb();
    }, saveData: function(key, cb){
      var data = [];
      for (var shp in this.doc.shapeRoot.shapes){
        data.push(this.doc.shapeRoot.shapes[shp].path)
      }
      whiteBoardData[key] = data;
      if (cb)
        cb();
    }, drawFromData: function(data, cb){
      this.doc.beginChange();
      for (var i=0; i<data.length; i++){
        var toaddpath = data[i];
        var jsobj = toaddpath.exportJSON({asString: !0,precision: 5});

        var new_shape = this.doc.createShapeItem();
        new_shape.path = new paper.Path;
        new_shape.path.importJSON(jsobj);
        this.doc.shapeRoot.addShapeItem(new_shape);
        //this.doc.shapeRoot.addShapeItem(data[i]);
      }
      this.doc.endChange();
      paper.view.update();
      //this.doc.loadSharedDocument();
      if (cb)
        cb();
    }
  }, {create: function(e) {
    return new t(e)
  }}
}), define("app", ["document", "painter", "util"], function(e, t, n) {
  var i = function() {
    this.painter = null, this.doc = null, this.defaultChannelKey = 'moximortc' + room_name;
  };
  return i.prototype = {init: function() {
    var r = window.location.search, i = {};
    if (r[0] === "?") {
      var s = r.substring(1).split("&");
      for (var o = 0, u = s.length; o < u; o++) {
        var a = s[o].split("=");
        i[a[0]] = a[1]
      }
    }
    var f = i.channel;
    typeof f == "string" && (this.defaultChannelKey = f),
      this.doc = e.createDocument(this),
      this.doc.initSharedDocument(this.defaultChannelKey),
      this.painter = t.create(this),
      this.painter.init($("#canvas-main")[0], $("#canvas-back")[0])
  },run: function() {
    console.log("Application::run: " + n.hello())
  }, grid: function(grid_val){
    this.painter.grid(grid_val);
  }, setActiveColor: function(cv){
    this.painter.setActiveColorValue(cv);
  }, setActiveThickness: function(thickName){
    this.painter.setActiveThicknessTool(thickName);
  }, startTool: function(tName){
    this.painter.startTool(tName);
  }, removeSelection: function(){
    this.painter.removeSelection();
  }, removeAll: function(cb){
    this.painter.removeAll(cb);
  }, cut: function(){
    this.painter.cut();
  }, copy: function(){
    this.painter.copy();
  }, paste: function(){
    this.painter.paste();
  }, insertImageFromUrl: function(url){
    this.painter.insertImageFromUrl(url);
  }, saveData: function(key, cb){
    this.painter.saveData(key, cb);
  }, drawFromData: function(data, cb){
    this.painter.drawFromData(data, cb);
  }
  }, new i
})/*, requirejs(["app"], function(e) {
 e.init(), e.run()
 });*/

