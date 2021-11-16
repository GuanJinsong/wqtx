<template>
  <div class="container">
    <img :src="planUrl" class="bg" />
    <div :class="['box', `box${type}`]">
      <div class="side" v-for="(side, index1) in data" :key="`${type}-${index1}`">
        <div class="grid" v-for="(item, index2) in side" :key="`${type}-${index1}-${index2}`" @click="toRoom(item)">
          <rightTooltip
            :result="item"
            :placement="placementOf(type, index1, index2)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import rightTooltip from "./Tooltip-right.vue";

export default {
  components: {
    rightTooltip
  },
  props: {
    /**
     * 1: 看守所
     *
     * 2: 拘留所1楼
     *
     * 3: 拘留所2楼
     */
    type: {
      required: false,
      type: Number,
      default: 1
    },
    list: {
      required: false,
      type: Array,
      default: function() {
        return []
      }
    }
  },
  data() {
    return {
      /**
       * 监室数据
       */
      data: []
    };
  },
  computed: {
    // 展开二位数组后的所有监室
    flatData: function() {
      return this.data.flat()
    },
    /**
     * 监所地图
     */
    planUrl: function() {
      switch (this.type) {
        case 1:
          // 看守所
          return "../../../static/images/plan1.png";
        case 2:
          // 拘留所1楼
          return "../../../static/images/plan2-f1.png";
        case 3:
          // 拘留所2楼
          return "../../../static/images/plan2-f2.png";
      }
    }
  },
  watch: {
    list: function(val) {
      let self = this

      // 数据更替时先初始化监室信息
      self.initData()

      val.forEach(outerValue => {
        let index = self.flatData.findIndex(innerValue => {
          // 通过监室名称包含的编号与本地定义的编号对比定位监室（如果监室的编号跟本地的不一致将无法定位）
          return innerValue.localId.match(/\d+\.?\d*/)[0] === outerValue.prisonName.match(/\d+\.?\d*/)[0]
        })
        
        if (index !== -1) {
          // 如果定位到本地编号对应的监室则将状态与监室id动态赋值给该监室数据源
          Vue.set(self.flatData[index], 'state', outerValue.prisonState)
          Vue.set(self.flatData[index], 'id', outerValue.prisonId)
        } 
      })
    }
  },
  created() {
    this.initData()
  },
  methods: {
    /**
     * 初始化格子数据
     */
    initData() {
      this.data = this.initGrids()
    },
    initGrids() {
      // name用于显示，id作为唯一标识符
      switch (this.type) {
        case 1: {
          let left = Array(12)
            .fill(0)
            .map((_, index) => {
              return {
                name: `2${(index + 6).toString().padStart(2, "0")}`,
                localId: `2${(index + 6).toString().padStart(2, "0")}`
              };
            });
          left[0].name = "201~206";
          left[0].localId = '206'

          let top1 = Array(4)
            .fill(0)
            .map((_, index) => {
              return {
                name: `2${index + 18}`,
                localId: `2${index + 18}`
              };
            });

          let middle = Array(11)
            .fill(0)
            .map((_, index) => {
              return {
                name: `1${(index + 6).toString().padStart(2, "0")}`,
                localId: `1${(index + 6).toString().padStart(2, "0")}`
              };
            });
          middle[0].name = "101";
          middle[0].localId = '101'
          middle[1].name = "102~107";
          middle[1].localId = '107'

          let top2 = Array(13)
            .fill(0)
            .map((_, index) => {
              return {
                name: `${index + 117}`,
                localId: `${index + 117}`
              };
            });

          let right = Array(12)
            .fill(0)
            .map((_, index) => {
              return {
                name: `${index + 130}`,
                localId: `${index + 130}`
              };
            });

          return [left, top1, middle, top2, right];
        }
        case 2: {
          let top = Array(8)
            .fill(0)
            .map((_, index) => {
              return {
                name: `拘留10${index + 1}`,
                localId: `10${index + 1}`
              };
            });
          return [top];
        }
        case 3: {
          let left = Array(6)
            .fill(0)
            .map((_, index) => {
              return {
                name: `拘留2${(index + 1).toString().padStart(2, "0")}`,
                localId: `2${(index + 1).toString().padStart(2, '0')}`
              };
            });

          let top = Array(8)
            .fill(0)
            .map((_, index) => {
              return {
                name: `拘留2${(index + 7).toString().padStart(2, "0")}`,
                localId: `2${(index + 7).toString().padStart(2, "0")}`
              };
            });

          let right = Array(6)
            .fill(0)
            .map((_, index) => {
              return {
                name: `拘留2${index + 15}`,
                localId: `拘留2${index + 15}`
              };
            });

          return [left, top, right];
        }
        default:
          return [];
      }
    },
    /**
     * 提示文本方向
     */
    placementOf(type, side, grid) {
      if (type === 1) {
        if (side === 0 || side === 2) {
          return "right"
        } else if (side === 1 || side === 3) {
          return "bottom"
        } else if (side === 4) {
          return "left"
        }
      } else if (type === 2) {
        return "bottom"
      } else if (type === 3) {
        if (side === 0) {
          return "right"
        } else if (side === 1) {
          return "bottom"
        } else if (side === 2) {
          return "left"
        }
      }
    },
    toRoom(data) {
      this.$emit('toRoom', data)
    }
  }
};
</script>

<style>
.container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}
.bg {
  width: 130%;
  height: 130%;
}
.box {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
}

.box1 .side:nth-of-type(1) {
  position: absolute;
  top: 18%;
  left: 10.5%;
  width: 7%;
  height: 45%;
  display: flex;
  flex-direction: column-reverse;
}
.box1 .side:nth-of-type(1) .grid {
  width: 100%;
  height: 8.33%;
}
.box1 .side:nth-of-type(2) {
  position: relative;
  top: 9%;
  left: 18%;
  width: 15%;
  height: 7%;
  display: flex;
  flex-direction: row;
}
.box1 .side:nth-of-type(2) .grid {
  width: 33.33%;
  height: 100%;
}
.box1 .side:nth-of-type(3) {
  position: absolute;
  top: 18%;
  left: 33%;
  width: 7.5%;
  height: 41.5%;
  display: flex;
  flex-direction: column-reverse;
}
.box1 .side:nth-of-type(3) .grid {
  width: 100%;
  height: 9%;
}
.box1 .side:nth-of-type(4) {
  position: absolute;
  left: 33%;
  top: 9%;
  width: 49%;
  height: 7%;
  display: flex;
  flex-direction: row;
}
.box1 .side:nth-of-type(4) .grid {
  width: 7.69%;
  height: 100%;
}
.box1 .side:nth-of-type(5) {
  position: absolute;
  left: 82.5%;
  top: 18%;
  width: 7%;
  height: 45%;
  display: flex;
  flex-direction: column;
}
.box1 .side:nth-of-type(5) .grid {
  width: 100%;
  height: 8.33%;
}

.box2 .side:nth-of-type(1) {
  position: absolute;
  left: 20%;
  top: 6%;
  width: 60%;
  height: 11%;
  display: flex;
  flex-direction: row;
}
.box2 .side:nth-of-type(1) .grid {
  width: 12.5%;
  height: 100%;
}

.box3 .side:nth-of-type(1) {
  position: absolute;
  left: 8%;
  top: 20%;
  width: 11%;
  height: 46%;
  display: flex;
  flex-direction: column-reverse;
}
.box3 .side:nth-of-type(1) .grid {
  width: 100%;
  height: 16.66%;
}
.box3 .side:nth-of-type(2) {
  position: absolute;
  left: 20%;
  top: 6%;
  width: 60%;
  height: 11%;
  display: flex;
  flex-direction: row;
}
.box3 .side:nth-of-type(2) .grid {
  width: 12.5%;
  height: 100%;
}
.box3 .side:nth-of-type(3) {
  position: absolute;
  right: 8%;
  top: 20%;
  width: 12%;
  height: 46%;
  display: flex;
  flex-direction: column;
}
.box3 .side:nth-of-type(3) .grid {
  width: 100%;
  height: 16.66%;
}

.grid {
  cursor: pointer;
}
.grid:hover {
  background-color: rgba(0, 225, 225, 0.3);
}
.el-tooltip {
  width: 100%;
  height: 100%;
}
</style>
