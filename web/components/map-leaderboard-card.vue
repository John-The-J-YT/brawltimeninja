<template>
  <card
    title="Best Players"
    :subtitle="subtitle"
  >
    <template v-slot:content>
      <p class="w-64">
        {{ isShowdown ? 'Most successful players' : 'Players with most wins'}}
        recorded by Brawl Time Ninja this season.
      </p>
      <div class="mt-2 darkbox">
        <player-rank-table
          :columns="columns"
          :column-names="columnNames"
          :rows="rows"
        ></player-rank-table>
      </div>
    </template>
  </card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { formatMode, metaStatMaps } from '~/lib/util'
import { PlayerRankTableRow } from './player-rank-table.vue'

interface Row {
  player_name: string
  player_tag: string
  player_icon_id: number
  picks: number
  wins: number
  battle_victory: number
  battle_rank: number
}

export default Vue.extend({
  props: {
    mode: {
      type: String,
    },
    map: {
      type: String,
    },
    id: {
      type: [String, Number],
    },
    timestamp: {
      type: String,
    },
  },
  data() {
    return {
      data: [] as Row[],
    }
  },
  watch: {
    isShowdown: '$fetch',
  },
  fetchDelay: 0,
  async fetch() {
    const data = await this.$clicker.query('mode.leaderboard',
      'battle',
      ['player_id'],
      ['player_name', 'player_icon_id' , ...(this.isShowdown? ['picks', 'battle_rank'] : ['wins', 'battle_victory'])], {
        ...this.$clicker.defaultSlices('battle'),
        trophy_season_end: ['current'],
        ...(this.map != undefined ? {
          battle_event_map: [this.map],
        } : {}),
        ...(this.mode != undefined ? {
          battle_event_mode: [this.mode],
        } : {}),
      }, {
        cache: 60*60,
        sort: {
          wins: 'desc',
        },
        limit: 5,
      })

    this.data = data.data
  },
  computed: {
    metaStatMaps() {
      return metaStatMaps
    },
    rows(): PlayerRankTableRow[] {
      return this.data.map(r => ({
        player_name: r.player_name,
        player_tag: r.player_tag,
        player_icon_id: r.player_icon_id,
        ...(this.isShowdown ? {
          picks: metaStatMaps.formatters.picks(r.picks),
          rank: metaStatMaps.formatters.rank(r.battle_rank),
        } : {
          wins: metaStatMaps.formatters.wins(Math.floor(r.wins)),
          winRate: metaStatMaps.formatters.winRate(r.battle_victory),
        }),
      }))
    },
    columns(): string[] {
      return this.isShowdown ? ['picks', 'rank'] : ['wins', 'winRate']
    },
    columnNames(): string[] {
      return this.isShowdown ?
        [metaStatMaps.labelsShort.picks, metaStatMaps.labelsShort.rank]
        : [metaStatMaps.labelsShort.wins, metaStatMaps.labelsShort.winRate]
    },
    subtitle(): string {
      if (this.mode == undefined) {
        return ''
      }
      if (this.map == undefined) {
        return `in ${formatMode(this.mode)}`
      }
      return `in ${formatMode(this.mode)} - ${this.map}`
    },
    isShowdown(): boolean {
      return this.mode != undefined && this.mode.toLowerCase().includes('showdown')
    },
  },
})
</script>
