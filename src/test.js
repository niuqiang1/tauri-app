import _ from "lodash";
const aa = [
  { name: "房地产", industry: "金融地产", color: "red", min: 0, max: 100 },
  { name: "非银金融", industry: "金融地产", color: "red", min: 0, max: 100 },
  { name: "建筑材料", industry: "金融地产", color: "red", min: 0, max: 100 },
  { name: "建筑装饰", industry: "金融地产", color: "red", min: 0, max: 100 },
  { name: "银行", industry: "金融地产", color: "red", min: 0, max: 100 },
  { name: "国防军工", industry: "国防军工", color: "red", min: 0, max: 100 },
  { name: "传媒", industry: "科技TMT", color: "red", min: 0, max: 100 },
  { name: "电子", industry: "科技TMT", color: "red", min: 0, max: 100 },
  { name: "计算机", industry: "科技TMT", color: "red", min: 0, max: 100 },
  { name: "通信", industry: "科技TMT", color: "red", min: 0, max: 100 },
  { name: "农林牧渔", industry: "农林牧渔", color: "red", min: 0, max: 100 },
  { name: "美容护理", industry: "医药生物", color: "red", min: 0, max: 100 },
  { name: "医药生物", industry: "医药生物", color: "red", min: 0, max: 100 },
  { name: "纺织服饰", industry: "消费服务", color: "red", min: 0, max: 100 },
  { name: "家用电器", industry: "消费服务", color: "red", min: 0, max: 100 },
  { name: "轻工制造", industry: "消费服务", color: "red", min: 0, max: 100 },
  { name: "商贸零售", industry: "消费服务", color: "red", min: 0, max: 100 },
  { name: "社会服务", industry: "消费服务", color: "red", min: 0, max: 100 },
  { name: "食品饮料", industry: "消费服务", color: "red", min: 0, max: 100 },
  { name: "电力设备", industry: "新能源", color: "red", min: 0, max: 100 },
  { name: "公用事业", industry: "新能源", color: "red", min: 0, max: 100 },
  { name: "环保", industry: "新能源", color: "red", min: 0, max: 100 },
  { name: "钢铁", industry: "资源周期", color: "red", min: 0, max: 100 },
  { name: "基础化工", industry: "资源周期", color: "red", min: 0, max: 100 },
  { name: "煤炭", industry: "资源周期", color: "red", min: 0, max: 100 },
  { name: "石油石化", industry: "资源周期", color: "red", min: 0, max: 100 },
  { name: "有色金属", industry: "资源周期", color: "red", min: 0, max: 100 },
  { name: "机械设备", industry: "高端制造", color: "red", min: 0, max: 100 },
  { name: "汽车", industry: "高端制造", color: "red", min: 0, max: 100 },
  { name: "交通运输", industry: "交通运输", color: "red", min: 0, max: 100 },
  { name: "综合", industry: "综合", color: "red", min: 0, max: 100 },
];

//   aa.map(i=>{

//   })

function Color() {
  let r = Math.floor(Math.random() * 255);
  let g = Math.floor(Math.random() * 255);
  let b = Math.floor(Math.random() * 255);
  return "rgba(" + r + "," + g + "," + b + ",0.8)";
}

const bb = {};
Object.keys(_.groupBy(aa, "industry")).map((i) => {
  bb[i] = Color();
});

console.log(
  _.map(_.groupBy(aa, "industry"), (val, key) => {
    return {
      value: val.length,
      name: key,
    };
  })
);

console.log();
console.log(bb);
