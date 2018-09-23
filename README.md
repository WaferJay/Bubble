# Bubble
HTML5 Canvas冒泡效果

---

## 选项
### element
DOM对象, 创建的canvas将添加到其中

### color
气泡颜色, 应当为如下对象:
```javascript
var color = {
    r: 255,  // 红色值
    g: 255,  // 绿色值
    b: 255,  // 蓝色值
    a: 255,  // 透明度, 可选

    toString: function() {
        // 返回rgba格式或hex格式色彩字符串
    },

    clone: function() {
        // 返回改对象的克隆对象
    }
}
```
你可以调用`parseHexColor`函数创建上面的对象:
```javascript
var red = parseHexColor("#ff0000"),
    alpha = parseHexColor("#ff000022");
```
color参数也可以像下面一样是返回颜色对象的函数
```javascript
function color() {
    var colors = ["#ff000022", "#00ff0022", "#0000ff22"],
        i = Math.floor(Math.random() * colors.length);
    
    return parseHexColor(colors[i]);
}
```

### bubbleFrom
气泡飘出的位置
* `Direct.TOP`从上边界向下飘出
* `Direct.BOTTOM`从下边界向上飘出
* `Direct.LEFT`从左边界飘出
* `Direct.RIGHT`从右边界飘出

可以使用按位或指定多个边界
```javascript
var from = Direct.TOP | Direct.BOTTOM;
```

### minSpeed
气泡移动的最小速度, 单位为秒

### maxSpeed
气泡移动的最大速度, 单位为秒

### minRadius
气泡的最小半径

### maxRadius
气泡的最大半径

### numBubble
气泡个数

### distance
气泡到消失移动的距离

### tick
刷新间隔, 单位毫秒, 默认值100

### onTransform
每给气泡变化后都会作为该函数参数, 便于自定义动画效果

### onTick
每次刷新后该方法被调用
