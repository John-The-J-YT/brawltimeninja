<template>
  <card>
    <plotly
      slot="content"
      :traces="chart.traces"
      :layout="chart.layout"
      :options="chart.options"
      class="h-80"
    ></plotly>
  </card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { metaStatMaps, MetaGridEntry, compare1 } from '../lib/util'

export default Vue.extend({
  props: {
    stat: {
      type: String,
      required: true
    },
    entries: {
      type: Array as PropType<MetaGridEntry[]>,
      required: true,
    },
  },
  computed: {
    chart(): any {
      const entries = this.entries.sort(compare1(this.stat as any))

      return {
        traces: [{
          x: entries.map(e => e.title),
          y: entries.map(e => e.stats[this.stat]),
          text: entries.map(e => e.title),
          type: 'bar',
        }],
        layout: {
          margin: { t: 0, l: 0, b: 0, r: 0 },
          showlegend: false,
          xaxis: {
            title: {
              text: 'Brawler',
              standoff: 10,
            },
            fixedrange: true,
            tickcolor: '#ffffff',
            automargin: true,
          },
          yaxis: {
            title: {
              text: metaStatMaps.labels[this.stat],
              standoff: 10,
            },
            fixedrange: true,
            tickformat: metaStatMaps.d3formatters[this.stat],
            tickcolor: '#ffffff',
            automargin: true,
          },
        },
      }
    },
  },
})
</script>
