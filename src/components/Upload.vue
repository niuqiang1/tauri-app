<script setup>
import { computed, ref } from "vue";
import { invoke } from "@tauri-apps/api/tauri";
import { message, save } from "@tauri-apps/api/dialog";
import { downloadDir } from "@tauri-apps/api/path";
import { writeBinaryFile, BaseDirectory, readBinaryFile } from "@tauri-apps/api/fs";
import xlsx from "node-xlsx";
import * as echarts from "echarts";
import { createCanvas, registerFont } from "canvas";
import { dialog } from "@tauri-apps/api";

const myFont = new FontFace("myFont", "url(../font/my.ttf)");

echarts.setCanvasCreator(() => {
  return createCanvas();
});
const greetMsg = ref("");
const name = ref("");
const colorLs = {
  金融地产: "rgba(98,98,98,0.8)",
  国防军工: "rgba(157,72,14,0.8)",
  科技TMT: "rgba(36,94,143,0.8)",
  农林牧渔: "rgba(112,171,70,0.8)",
  医药生物: "rgba(68,114,195,0.8)",
  消费服务: "rgba(255,191,0,0.8)",
  新能源: "rgba(163,163,163,0.8)",
  资源周期: "rgba(235,124,48,0.8)",
  高端制造: "rgba(255,229,151,0.8)",
  交通运输: "rgba(195,223,179,0.8)",
  综合: "rgba(249,76,169,0.8)",
};
const colorLs2 = {
  金融地产: "rgba(98,98,98,0.2)",
  国防军工: "rgba(157,72,14,0.2)",
  科技TMT: "rgba(36,94,143,0.2)",
  农林牧渔: "rgba(112,171,70,0.2)",
  医药生物: "rgba(68,114,195,0.2)",
  消费服务: "rgba(255,191,0,0.2)",
  新能源: "rgba(163,163,163,0.2)",
  资源周期: "rgba(235,124,48,0.2)",
  高端制造: "rgba(255,229,151,0.2)",
  交通运输: "rgba(195,223,179,0.2)",
  综合: "rgba(249,76,169,0.2)",
};
let active = ref("");
let zhanbi = ref([]);
let shouyi = ref([]);

const keyword = ref("");

let activeChart = ref("");

let curmax = ref("");
let curmin = ref("");

let dataUrls = ref([]);

const file1 = ref(null);
const file2 = ref(null);

// 用户切换
function changeMana(name) {
  active.value = name;
  genChart();
}

// 搜索用户
function search() {}

const allManagers = computed(() => {
  if (keyword.value) {
    return Object.keys(zhanbi.value).filter((i) => i.includes(keyword.value));
  } else {
    return Object.keys(zhanbi.value);
  }
});

async function handleFileChange(type) {
  const file = type == "zb" ? file1.value : file2.value;
  const reader = new FileReader();
  reader.readAsArrayBuffer(file);
  reader.onload = async function (e) {
    console.log(e);

    let fileU8A = new Uint8Array(e.target.result);
    await writeBinaryFile(type, fileU8A, { dir: BaseDirectory.AppCache });

    // writeBinaryFile({ path: "avatar.png", contents: fileU8A, dir: BaseDirectory.Desktop });
  };

  // Write a binary file to the `$APPDATA/avatar.png` path
}

// 生成图像
async function genChart(isSf = false) {
  dataUrls.value = [];
  curmin.value = "";
  curmax.value = "";
  const contents1 = await readBinaryFile("zb", { dir: BaseDirectory.AppCache });
  const contents2 = await readBinaryFile("sy", { dir: BaseDirectory.AppCache });

  const sheets = xlsx.parse(contents1);
  const sheets2 = xlsx.parse(contents2);
  zhanbi.value = getData(sheets, isSf);
  shouyi.value = getData(sheets2, isSf);

  if (active.value) {
    genUserChart(active.value);
  }
}

function genUserChart(key) {
  console.log(key, "pppp");
  activeChart.value = renderChart(zhanbi.value[key], shouyi.value[key], key).toDataURL("image/png");
}

function getData(sheets, isSf) {
  console.log(sheets);
  // 表头
  const header = sheets[0].data[0].splice(3);

  // 数据
  let data = sheets[0].data.splice(1);
  const dataRow = {};
  data.map((item) => {
    dataRow[item[1]] = {
      data: isSf ? sf(item.splice(5), 0, 100) : item.splice(5),
      company: item.splice(2, 1),
      name: item[1],
    };
    // dataRow[item[1]] = sf.sf(item.splice(3), 0, 100);
  });

  return dataRow;
}

function sf(data, min, max) {
  const minV = Math.min(...data);
  const maxV = Math.max(...data);

  curmin.value = minV.toFixed(2);
  curmax.value = maxV.toFixed(2);

  // 区间缩放
  const output = data.map((i) => {
    const tt = (i - minV) / (maxV - minV);
    return min + tt * (max - min);
  });

  return output;
}

function renderChart(data1, data2, name) {
  const canvas = createCanvas(1600, 1400);
  const chart = echarts.init(canvas, "");

  // 像正常使用一样 setOption
  chart.setOption({
    animation: false,

    title: {
      text: name,
      textStyle: {
        fontSize: 38,
        // fontFamily: myFont,
      },
      subtext: data1.company,
      subtextStyle: {
        fontSize: 28,
      },
    },
    legend: {
      data: ["近五年平均配置比例", "近五年平均收益率"],
      itemHeight: 30,
      itemWidth: 40,

      textStyle: {
        fontSize: 32,
        // fontFamily: "myFont",
      },
    },
    axisLabel: {
      show: false,
    },
    axisLine: {
      show: true,
      lineStyle: {
        color: "rgba(255,255,255,0.2)",
      },
    },

    radar: {
      shape: "circle",
      nameGap: 20,
      splitNumber: 4,
      radius: "65%",
      axisName: {
        fontSize: 28,
      },
      axisLine: {
        lineStyle: {
          color: "rgba(0,0,0, 0.1)",
        },
      },
      splitLine: {
        lineStyle: {
          color: ["rgba(238, 197, 102, 0.4)", "rgba(238, 197, 102, 0.6)", "rgba(238, 197, 102, 0.8)", "rgba(238, 197, 102, 1)"],
        },
      },
      indicator: [
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
      ].map((item) => {
        item.color = colorLs[item.industry];
        return item;
      }),
    },

    series: [
      {
        zlevel: 0,
        labelLine: {
          show: false,
          length: 120,
        },
        label: {
          fontSize: 30,
          color: "#555",
          backgroundColor: "inherit",
          padding: [14, 20, 14, 20],
          overflow: "break",
        },
        // labelLayout(params) {
        //   return {
        //     verticalAlign: "top",
        //     align: "left",
        //     height: 200,
        //   };
        // },
        type: "pie",
        clockwise: false,
        // radius: [50, 300],
        radius: "65%",
        data: [
          {
            value: 5,
            name: "金融地产",
            itemStyle: {
              borderRadius: 0,
              color: colorLs2["金融地产"],
            },
          },
          {
            value: 1,
            name: "国防军工",
            itemStyle: {
              borderRadius: 0,
              color: colorLs2["国防军工"],
            },
          },
          {
            value: 4,
            name: "科技TMT",
            itemStyle: {
              borderRadius: 0,
              color: colorLs2["科技TMT"],
            },
          },
          {
            value: 1,
            name: "农林牧渔",
            itemStyle: {
              borderRadius: 0,
              color: colorLs2["农林牧渔"],
            },
          },
          {
            value: 2,
            name: "医药生物",
            itemStyle: {
              borderRadius: 0,
              color: colorLs2["医药生物"],
            },
          },
          {
            value: 6,
            name: "消费服务",
            itemStyle: {
              borderRadius: 0,
              color: colorLs2["消费服务"],
            },
          },
          {
            value: 3,
            name: "新能源",
            itemStyle: {
              borderRadius: 0,
              color: colorLs2["新能源"],
            },
          },
          {
            value: 5,
            name: "资源周期",
            itemStyle: {
              borderRadius: 0,
              color: colorLs2["资源周期"],
            },
          },
          {
            value: 2,
            name: "高端制造",
            itemStyle: {
              borderRadius: 0,
              color: colorLs2["高端制造"],
            },
          },
          {
            value: 1,
            name: "交通运输",
            label: {
              show: false,
            },
            itemStyle: {
              borderRadius: 0,
              color: colorLs2["交通运输"],
            },
          },
          {
            value: 1,
            name: "综合",
            label: {
              show: false,
            },
            itemStyle: {
              borderRadius: 0,
              color: colorLs2["综合"],
            },
          },
        ],
      },
      {
        type: "radar",
        color: ["#ffcc00", "#376db6"],

        data: [
          {
            value: data1.data,
            name: "近五年平均配置比例",
            label: {},
            areaStyle: {
              color: new echarts.graphic.RadialGradient(0.1, 0.6, 1, [
                {
                  color: "rgba(255,204,0, 0.3)",
                  offset: 0,
                },
                {
                  color: "rgba(255,204,0, 0.8)",
                  offset: 1,
                },
              ]),
            },
          },
          {
            value: data2.data,
            name: "近五年平均收益率",
            areaStyle: {
              color: new echarts.graphic.RadialGradient(0.1, 0.6, 1, [
                {
                  color: "rgba(55,109,182, 0.3)",
                  offset: 0,
                },
                {
                  color: "rgba(55,109,182, 0.8)",
                  offset: 1,
                },
              ]),
            },
          },
        ],
      },
    ],
  });
  return canvas;
}

async function downloadImg() {
  const key = active.value;
  const basePath = await downloadDir();
  let selPath = await save({
    defaultPath: basePath,
  });
  if (selPath) {
    selPath = selPath.replace(/Untitled$/, key);

    renderChart(zhanbi.value[key], shouyi.value[key], key).toBlob((da) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(da);
      reader.onload = async function (e) {
        let fileU8A = new Uint8Array(e.target.result);
        try {
          await writeBinaryFile({ path: selPath + ".png", contents: fileU8A });
          message("图片已保存");
        } catch (error) {
          message("保存失败！");
        }
      };
    });
  }
}
</script>

<template>
  <div class="main-card">
    <form>
      <div class="form-item">
        <q-file
          filled
          bottom-slots
          v-model="file1"
          label="平均占比.xlsx"
          counter
          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          @update:model-value="handleFileChange('zb')">
          <template v-slot:prepend>
            <q-icon name="cloud_upload" @click.stop.prevent />
          </template>
          <template v-slot:append>
            <q-icon name="close" @click.stop.prevent="model = null" class="cursor-pointer" />
          </template>
        </q-file>

        <!-- <input
          id="greet-input"
          name="file1"
          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          type="file"
          @change="handleFileChange" /> -->
      </div>

      <div class="form-item">
        <q-file
          filled
          bottom-slots
          v-model="file2"
          label="平均收益率.xlsx"
          counter
          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          @update:model-value="handleFileChange('sy')">
          <template v-slot:prepend>
            <q-icon name="cloud_upload" @click.stop.prevent />
          </template>
          <template v-slot:append>
            <q-icon name="close" @click.stop.prevent="model = null" class="cursor-pointer" />
          </template>
        </q-file>

        <!-- <input
          id="greet-input2"
          name="file2"
          type="file"
          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          @change="handleFileChange" /> -->
      </div>
      <div class="text-center">
        <q-btn color="primary" @click.prevent="genChart()" label="生成" />
      </div>
    </form>
    <section class="row">
      <div class="col col-3">
        <q-input rounded outlined v-model="keyword" class="q-mb-md" label="搜索">
          <template v-slot:append>
            <q-icon name="search" class="cursor-pointer" @click="search"></q-icon>
          </template>
        </q-input>
        <q-list bordered separator v-if="allManagers.length">
          <q-virtual-scroll style="max-height: 500px" :items="allManagers" separator v-slot="{ item, index }">
            <q-item :key="index" clickable v-ripple :active="active == item" active-class="bg-teal-1 text-grey-8" @click="changeMana(item)">
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white" icon="face" />
              </q-item-section>
              <q-item-section
                >{{ item }}
                <span></span>
              </q-item-section>
            </q-item>
          </q-virtual-scroll>
        </q-list>
        <div v-else class="text-center q-mt-xl">
          <q-icon name="mood_bad" size="xl" color="warning"></q-icon>
          <span class="text-amber"> 暂无</span>
        </div>
      </div>
      <div class="img-container col">
        <div v-if="activeChart">
          <div class="q-ml-xl float-right rr">
            <q-btn color="amber" @click="downloadImg" label="下载" />
            <q-btn class="q-mt-sm" color="indigo" @click="genChart()" label="固定刻度（0-100）" />
            <q-btn class="q-mt-sm" color="light-blue" @click="genChart(true)" label="动态刻度" />
          </div>

          <img width="600" :src="activeChart" alt="" />
        </div>
        <div class="empty text-orange" v-else>
          <q-icon name="warning" class="text-orange" size="2em" />
          请选择基金经理
        </div>
      </div>
    </section>
  </div>
</template>
<style scoped>
.rr {
  display: flex;
  flex-direction: column;
}
form {
  background: #fff;
  padding-bottom: 20px;
  margin-bottom: 40px;
  border-bottom: 1px dashed #000;
}
.img-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.img-container img {
  background: #fff;
  padding: 20px;
  box-shadow: 0px 0px 20px 20px #eee;
}
.empty {
  height: 600px;
  width: 600px;
  padding: 20px;
  box-shadow: 0px 0px 20px 20px #eee;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
