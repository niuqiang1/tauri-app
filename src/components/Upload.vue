<script setup>
import { ref } from "vue";
import { invoke } from "@tauri-apps/api/tauri";
import { message } from "@tauri-apps/api/dialog";
import { writeBinaryFile, BaseDirectory, readBinaryFile } from "@tauri-apps/api/fs";
import xlsx from "node-xlsx";
import * as echarts from "echarts";
import { createCanvas } from "canvas";

echarts.setCanvasCreator(() => {
  return createCanvas();
});
const greetMsg = ref("");
const name = ref("");
let active = ref(true);
let zhanbi = ref([]);
let shouyi = ref([]);

let activeChart = ref("");

const allManagers = ref([]);
let dataUrls = ref([]);

const file1 = ref(null);
const file2 = ref(null);

// 用户切换
function changeMana(name) {
  active.value = name;
  genUserChart(name);
}

async function handleFileChange(type) {
  const file = type == "zb" ? file1.value : file2.value;
  const reader = new FileReader();
  reader.readAsArrayBuffer(file);
  reader.onload = async function (e) {
    console.log(e);

    let fileU8A = new Uint8Array(e.target.result);
    await writeBinaryFile(type, fileU8A, { dir: BaseDirectory.Desktop });

    // writeBinaryFile({ path: "avatar.png", contents: fileU8A, dir: BaseDirectory.Desktop });
  };

  // Write a binary file to the `$APPDATA/avatar.png` path
}
async function genChart() {
  dataUrls.value = [];
  const contents1 = await readBinaryFile("zb", { dir: BaseDirectory.Desktop });
  const contents2 = await readBinaryFile("sy", { dir: BaseDirectory.Desktop });
  const sheets = xlsx.parse(contents1);
  const sheets2 = xlsx.parse(contents2);
  zhanbi.value = getData(sheets);
  shouyi.value = getData(sheets2);

  allManagers.value = Object.keys(zhanbi.value);
}

function genUserChart(key) {
  // Object.keys(zhanbi.value).forEach((key) => {
  // const reader = new FileReader();
  // reader.readAsArrayBuffer(renderChart(zhanbi.value[key], shouyi.value[key], key).toBuffer());

  // reader.onload = async function (e) {
  //   console.log(e);
  //   let fileU8A = new Uint8Array(e.target.result);
  //   await writeBinaryFile(key + ".png", fileU8A, { dir: BaseDirectory.Desktop });

  //   // writeBinaryFile({ path: "avatar.png", contents: fileU8A, dir: BaseDirectory.Desktop });
  // };

  renderChart(zhanbi.value[key], shouyi.value[key], key).toBlob((da) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(da);
    reader.onload = async function (e) {
      console.log(e);
      let fileU8A = new Uint8Array(e.target.result);
      await writeBinaryFile(key + ".png", fileU8A, { dir: BaseDirectory.Desktop });

      // writeBinaryFile({ path: "avatar.png", contents: fileU8A, dir: BaseDirectory.Desktop });
    };
  });

  // const dataUrl = renderChart(zhanbi.value[key], shouyi.value[key], key).toDataURL("image/png");
  activeChart.value = renderChart(zhanbi.value[key], shouyi.value[key], key).toDataURL("image/png");

  // dataUrls.value.push(dataUrl);
  // await writeBinaryFile(key + ".png", dataUrl, { dir: BaseDirectory.Desktop });

  // fs.writeFile(key + ".png", renderChart(zhanbi[key], shouyi[key], key).toBuffer("image/png"), {}, (err) => {
  //   if (err) {
  //     console.error(err);
  //   }
  // });
  // });
}

function getData(sheets) {
  console.log(sheets);
  // 表头
  const header = sheets[0].data[0].splice(3);

  console.log(header);
  // 数据
  let data = sheets[0].data.splice(1);
  const dataRow = {};
  data.map((item) => {
    dataRow[item[1]] = sf(item.splice(3), 0, 100);
    // dataRow[item[1]] = sf.sf(item.splice(3), 0, 100);
  });

  return dataRow;
}

function sf(data, min, max) {
  const minV = Math.min(...data);
  const maxV = Math.max(...data);

  // 区间缩放
  const output = data.map((i) => {
    const tt = (i - minV) / (maxV - minV);
    return min + tt * (max - min);
  });

  return output;
}

function renderChart(data1, data2, name) {
  const canvas = createCanvas(800, 800);
  const chart = echarts.init(canvas, "dark");

  // 像正常使用一样 setOption
  chart.setOption({
    animation: false,

    title: {
      text: name + "测试图",
    },
    color: ["#cbf156", "#56A3F1"],
    legend: {
      data: ["平均占比", "平均收益率"],
    },
    axisLabel: {
      show: true,
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
      splitNumber: 2,
      axisName: {
        formatter: "【{value}】",
      },
      indicator: [
        { name: "交通运输", color: "red", min: 0, max: 100 },
        { name: "传媒", color: "red", min: 0, max: 100 },
        { name: "公用事业", color: "red", min: 0, max: 100 },
        { name: "农林牧渔", color: "red", min: 0, max: 100 },
        { name: "医药生物", color: "blue", min: 0, max: 100 },
        { name: "商贸零售", color: "blue", min: 0, max: 100 },
        { name: "国防军工", color: "blue", min: 0, max: 100 },
        { name: "基础化工", color: "blue", min: 0, max: 100 },
        { name: "家用电器", color: "blue", min: 0, max: 100 },
        { name: "建筑材料", color: "yellow", min: 0, max: 100 },
        { name: "建筑装饰", color: "yellow", min: 0, max: 100 },
        { name: "房地产", color: "yellow", min: 0, max: 100 },
        { name: "有色金属", color: "yellow", min: 0, max: 100 },
        { name: "机械设备", color: "blue", min: 0, max: 100 },
        { name: "汽车", color: "pink", min: 0, max: 100 },
        { name: "煤炭", color: "pink", min: 0, max: 100 },
        { name: "环保", color: "pink", min: 0, max: 100 },
        { name: "电力设备", color: "pink", min: 0, max: 100 },
        { name: "电子", color: "pink", min: 0, max: 100 },
        { name: "石油石化", color: "grey", min: 0, max: 100 },
        { name: "社会服务", color: "grey", min: 0, max: 100 },
        { name: "纺织服饰", color: "grey", min: 0, max: 100 },
        { name: "综合", color: "grey", min: 0, max: 100 },
        { name: "美容护理", color: "grey", min: 0, max: 100 },
        { name: "计算机", color: "grey", min: 0, max: 100 },
        { name: "轻工制造", color: "orange", min: 0, max: 100 },
        { name: "通信", color: "orange", min: 0, max: 100 },
        { name: "钢铁", color: "orange", min: 0, max: 100 },
        { name: "银行", color: "orange", min: 0, max: 100 },
        { name: "非银金融", color: "orange", min: 0, max: 100 },
        { name: "食品饮料", color: "orange", min: 0, max: 100 },
      ],
    },

    series: [
      {
        type: "radar",
        data: [
          {
            value: data1,
            name: "平均占比",
            label: {},
            areaStyle: {
              color: new echarts.graphic.RadialGradient(0.1, 0.6, 1, [
                {
                  color: "rgba(203, 241, 86, 0.1)",
                  offset: 0,
                },
                {
                  color: "rgba(203, 241, 86, 0.6)",
                  offset: 1,
                },
              ]),
            },
          },
          {
            value: data2,
            name: "平均收益率",
            areaStyle: {
              color: new echarts.graphic.RadialGradient(0.1, 0.6, 1, [
                {
                  color: "rgba(86, 163, 241, 0.1)",
                  offset: 0,
                },
                {
                  color: "rgba(86, 163, 241, 0.6)",
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
        <q-btn color="primary" @click.prevent="genChart" label="生成" />
      </div>
    </form>
    <section class="row">
      <div class="col col-3">
        <q-list bordered separator>
          <q-virtual-scroll style="max-height: 300px" :items="allManagers" separator v-slot="{ item, index }">
            <q-item :key="index" clickable v-ripple :active="active == item" active-class="bg-teal-1 text-grey-8" @click="changeMana(item)">
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white" icon="face" />
              </q-item-section>
              <q-item-section>{{ item }}</q-item-section>
            </q-item>
          </q-virtual-scroll>
        </q-list>
      </div>
      <div class="img-container col">
        <img width="600" :src="activeChart" alt="" />
      </div>
    </section>
  </div>
</template>
<style scoped>
.main-card {
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
</style>
