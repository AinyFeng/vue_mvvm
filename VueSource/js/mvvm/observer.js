function Observer(data) {
    // 保存data对象
    this.data = data;
    // 走起  开启对data的监视
    this.walk(data);
}

Observer.prototype = {
    walk: function(data) {
      //保存observe对象
        var me = this;
        // 遍历data中所有属性
        Object.keys(data).forEach(function(key) {
            // 针对指定属性进行处理
            me.convert(key, data[key]);
        });
    },
    convert: function(key, val) {
        // 对指定属性实现响应式数据绑定
        this.defineReactive(this.data, key, val);
    },

    defineReactive: function(data, key, val) {
        // 创建与当前属性对应的dep对象  Dep:dependency(依赖)
        var dep = new Dep();
        // 间接递归调用实现对data中所有层次属性的劫持
      //通过间接递归调用实现data中所有层次属性的劫持
        var childObj = observe(val);
        // 给data重新定义属性(因为要添加set/get方法)
      //get的作用：返回值，建立dep与watcher之间的关系
      //set的作用：监视data中属性值的变化
        Object.defineProperty(data, key, {
            enumerable: true, // 可枚举
            configurable: false, // 不能再define
            get: function() {// 返回值
                // 建立dep与watcher的关系
                if (Dep.target) {
                    dep.depend();
                }
                // 返回属性值
                return val;
            },
            set: function(newVal) {//监视key属性的变化，更新界面
                if (newVal === val) {
                    return;
                }
                val = newVal;
                // 新的值是object的话，进行监听
                childObj = observe(newVal);
                // 通过dep 通知所有相关的订阅者（watcher）
                dep.notify();
            }
        });
    }
};

function observe(value, vm) {
    // value必须是对象, 因为监视的是对象内部的属性
    if (!value || typeof value !== 'object') {
        return;
    }
    // 创建一个对应的观察者对象
    return new Observer(value);
};


var uid = 0;

function Dep() {
    // 标识属性
    this.id = uid++;
    // 相关的所有watcher的数组
    this.subs = [];
}

Dep.prototype = {
  //添加watcher到dep中
    addSub: function(sub) {
        this.subs.push(sub);
    },
    //去建立dep与watcher之间的关系
    depend: function() {
        Dep.target.addDep(this);
    },
    //移除
    removeSub: function(sub) {
        var index = this.subs.indexOf(sub);
        if (index != -1) {
            this.subs.splice(index, 1);
        }
    },

    notify: function() {
        // 通知所有相关的watcher(一个订阅者)
      //遍历所有的watcher，通知watcher更新
        this.subs.forEach(function(sub) {
            sub.update();
        });
    }
};

Dep.target = null;