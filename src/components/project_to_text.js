// 参数解析：project:相对应一个的项目,type:是一个布尔值: true,false
var projectHandle = {};

projectHandle.todo = function(project, type){
	var str;
	var condition = parseInt(project.settlement.conditionType); 
	var pro = project.settlement;
	let some = '';
	let brand = pro.childData;
	if(type){
		switch (condition)
		{
			// 统一包干结算
			case 1:
			str = pro.beginCalculateType + pro.days + "天结算,  " + pro.priceType + pro.calculateType + pro.price + "元/吨  ";
			break;

			// 分品牌包干结算
			case 2:
			for(let i = 0 ; i < brand.length; i++){
				some += brand[i].onemoreBrand + brand[i].priceType + brand[i].calculateType + brand[i].price + "元/吨  ";
			}
			str = pro.beginCalculateType + pro.days + "天结算,  " + some;
			break;

			// 分品名包干结算
			case 3:
			str = pro.beginCalculateType + pro.days + "天结算,  " + "高线:" + pro.cate_spec[0].calculateType + pro.cate_spec[0].price + "元/吨,  " + "盘螺:" + pro.cate_spec[1].calculateType + pro.cate_spec[1].price + "元/吨,  " + "螺纹钢:" + pro.cate_spec[2].calculateType + pro.cate_spec[2].price + "元/吨";
			break;

			// 统一分拆结算
			case 4:
			str = pro.beginCalculateType + pro.days + "天结算,  " + pro.priceType + pro.calculateType + pro.price + "元/吨,  " + "运费：" + pro.freight + "元/吨,  " + "过磅费:" + pro.ponderation_price + "元/吨,";
			break;

			// 分品牌分拆结算
			case 5:
			for(let j = 0 ; j < brand.length; j++){
				some += brand[j].onemoreBrand + brand[j].priceType + brand[j].calculateType + brand[j].price + "元/吨  ";
			}
			str = pro.beginCalculateType + pro.days + "天结算,  " + some + "运费：" + pro.freight + "元/吨,  " + "过磅费:" + pro.ponderation_price + "元/吨  ";
			break;

			// 综合费率结算
			case 6:
			str = pro.beginCalculateType + pro.days + "天结算,  " + pro.priceType + pro.calculateType + pro.price + "元/吨,  " + "运费：" + pro.freight + "元/吨,  " + "过磅费:" + pro.ponderation_price + "元/吨,  " + "吊机费:" + pro.crane_price + "元/吨,  " + "资金费率:" + pro.funds_price_rate +"元/吨  " ;
			break;

			// 其他方式结算
			case 7:
			str = pro.elsePayWay;
			break;

			// 已通过的状态8
			default:  
			str = pro.elsePayWay;
			break;
		}
		return str;
		
	}else{
		switch (condition)
		{
			// 统一包干结算
			case 1:
			str = pro.beginCalculateType + pro.days + "天结算<br />  " + pro.priceType + pro.calculateType + pro.price + "元/吨 ";
			break;

			// 分品牌包干结算
			case 2:
			for(let i = 0 ; i < brand.length; i++){
				some += brand[i].onemoreBrand + brand[i].priceType + brand[i].calculateType + brand[i].price + "元/吨<br />";
			}
			str = pro.beginCalculateType + pro.days + "天结算<br /> " + some;
			break;

			// 分品名包干结算
			case 3:
			str = pro.beginCalculateType + pro.days + "天结算<br />  "+ "高线:" + pro.cate_spec[0].calculateType + pro.cate_spec[0].price + "元/吨<br />  " + "盘螺:" + pro.cate_spec[1].calculateType + pro.cate_spec[1].price + "元/吨<br />  " + "螺纹钢:" + pro.cate_spec[2].calculateType + pro.cate_spec[2].price + "元/吨<br />";
			break;

			// 统一分拆结算
			case 4:
			str = pro.beginCalculateType + pro.days + "天结算<br />  " + pro.priceType + pro.calculateType + pro.price + "元/吨<br />  " + "运费：" + pro.freight + "元/吨<br />  " + "过磅费:" + pro.ponderation_price + "元/吨<br />";
			break;

			// 分品牌分拆结算
			case 5:
			for(let j = 0 ; j < brand.length; j++){
				some += brand[j].onemoreBrand + brand[j].priceType + brand[j].calculateType + brand[j].price + "元/吨<br />  ";
			}
			str = pro.beginCalculateType + pro.days + "天结算<br />  " + some + "运费：" + pro.freight + "元/吨<br /> " + "过磅费:" + pro.ponderation_price + "元/吨  ";
			break;

			// 综合费率结算
			case 6:
			str = pro.beginCalculateType + pro.days + "天结算<br /> " + pro.priceType + pro.calculateType + pro.price + "元/吨<br />  " + "运费：" + pro.freight + "元/吨<br />  " + "过磅费:" + pro.ponderation_price + "元/吨<br />  " + "吊机费:" + pro.crane_price + "元/吨<br />  " + "资金费率:" + pro.funds_price_rate +"元/吨<br />  " ;
			break;

			// 其他方式结算
			case 7:
			str = pro.elsePayWay;
			break;

			// 已通过的状态8
			default:  
			str = pro.elsePayWay;
			break;
		}
		return str;
	}

}

export default projectHandle;
