/*
    Example :
        import sortMethods from "...";

        let tableDatas = [
            {product: "螺纹钢", type: "18", material: "HRB400E", brands: "昌盛", web_price: "4450", …},
            {product: "螺纹钢", type: "18", material: "HRB400E", brands: "昌盛", web_price: "4450", …},
            ...
        ]

        let result = sortMethods.todo(tableDatas, [
            { text : "品名", key : "product" },
            { text : "规格", key : "type" },
            { text : "材质", key : "material" },
            { text : "网价", key : "web_price" },
        ], "desc");

    Usage :
        参数为：table数据、一个index(如上所示)、设置正序倒叙

    Return :
        将table数据排序好并返回一个新的table数据数组
*/

var steelSort = {};

steelSort.init = function(index){
    // 获取品名/规格/材质对应的key值
    let temp = ["品名", "规格", "材质"];
    let result = [];
    for(let item of temp){
        for(let data of index){
            if(data.text == item){
                result.push({
                    key : data.key,
                    sort : 0
                });
            }
        }
    }
    return result;
}

steelSort.todo = function(datas, index, type, sortKey){
    let _this = this;
    let _sortKey = sortKey ? sortKey : index[index.length-1].key;
    this.steelKey = this.init(index);
    // 先求出切割的顺序, 如果都是同一品名/规格/材质，则不切割
    for(let data of this.steelKey){
        let splitResult = this.classify(datas, data.key);
        if(splitResult[0] instanceof Array){
            data.sort = splitResult.length;
        }
    }

    // 将数据进行分类、分级
    this.loopClassify(datas, 0);
    // 品名排序
    this.splitResult.sort(function(a, b){
        return b[0][0][0][_this.steelKey[0].key].length - a[0][0][0][_this.steelKey[0].key].length;
    });
    // 规格排序
    for(let data of this.splitResult){
        data.sort(function(a, b){
            return parseInt(a[0][0][_this.steelKey[1].key]) - parseInt(b[0][0][_this.steelKey[1].key]);
        });
    }
    // 材质排序
    for(let datas of this.splitResult){
        for(let data of datas){
            data.sort(function(a, b){
                let numA = parseInt(a[0][_this.steelKey[2].key].replace('HRB400E', '4').replace("HRB400", "3").replace("HRB500E", "2").replace("HRB500", "1"));
                let numB = parseInt(b[0][_this.steelKey[2].key].replace('HRB400E', '4').replace("HRB400", "3").replace("HRB500E", "2").replace("HRB500", "1"));
                if(isNaN(numA) || isNaN(numB)){
                    return -9999;
                }else{
                    return numB - numA;
                }
            });
        }
    }
    // 最终价格排序 降维
    let allResult = [];
    for(let datas of this.splitResult){
        for(let data of datas){
            for(let item of data){
                item.sort(function(a, b){
                    if(type=="desc"){
                        return parseInt(a[_sortKey]) - parseInt(b[_sortKey]);
                    }
                    return parseInt(b[_sortKey]) - parseInt(a[_sortKey]);
                });
                for(let best of item){
                    allResult.push(best);
                }
            }
        }
    }
    return JSON.parse(JSON.stringify(allResult));
}

// 递归将分类好的数据 输出为 树形数据
steelSort.loopClassify = function(tableDatas, count){
    let arr = [];
    if(count !== 3){
        if((tableDatas[0] instanceof Array) && count===1){
            for(let data of tableDatas){
                arr.push(this.classify(data, this.steelKey[count].key));
            }
        }else if(!(tableDatas[0] instanceof Array)){
            arr = this.classify(tableDatas, this.steelKey[count].key);
        }else if((tableDatas[0] instanceof Array) && count===2){
            for(let datas of tableDatas){
                let tmp = [];
                for(let data of datas){
                    tmp.push(this.classify(data, this.steelKey[count].key));
                }
                arr.push(tmp);
            }
        }
    }

    if(count<=2){
        this.loopClassify(arr, (++count))
    }else{
        steelSort.splitResult = tableDatas;
    }
}

// 递归将数据分类
steelSort.classify = function(sourceTable, key){
    let index = 0;
    let tableDatas = JSON.parse(JSON.stringify(sourceTable));
    let arr = [tableDatas.splice(0, 1)[0]];

    while(index < tableDatas.length){
        for(let item of arr){
            if(item[key] == tableDatas[index][key]){
                arr.push(tableDatas.splice(index, 1)[0]);
                index--;
                break;
            }
        }
        index++;
    }
    if(tableDatas.length!==0 && tableDatas[0]!==undefined){
        let tmp = this.classify(tableDatas, key);
        if(tmp[0].length===undefined){
            arr = [arr, tmp];
        }else{
            tmp.push(arr);
            arr = tmp;
        }
    }
    if(!(arr[0] instanceof Array)){
        return [arr];
    }else{
        return arr;
    }
}

export default steelSort;
