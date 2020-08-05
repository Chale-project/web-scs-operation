<template>
  <div :style="{ padding: '0 0 32px 32px' }">
    <h4 :style="{ marginBottom: '20px' }">{{ title }}</h4>
    <v-chart height="254" :data="data" :forceFit="true" :padding="['auto', 'auto', '20', '50']">
      <v-legend dataKey="item" position="top-right" />
      <v-tooltip />
      <v-axis />
      <v-bar position="key*value" color="item" :adjust="adjust" />
    </v-chart>
  </div>
</template>

<script>
export default {
  name: 'groupedBar',
  props: {
    title: {
      type: String,
      default: ''
    },
    data: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      adjust: [
        {
          type: 'dodge',
          marginRatio: 2 / 32
        }
      ]
    }
  }
}
</script>
