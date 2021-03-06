<template>
  <div class="brawler-avatars">
    <div v-if="$fetchState.pending" class="brawler-avatars__placeholder" style="height: 55px"></div>
    <div
      v-for="team in teams.slice(0, limit)"
      :key="team.id"
      class="brawler-avatars__element w-1/2 mx-1"
    >
      <router-link
        v-for="brawler in team.brawlers"
        :key="brawler"
        :to="`/tier-list/brawler/${brawlerId({ name: brawler })}`"
        :class="{
          'w-1/2': team.brawlers.length == 2,
          'w-1/3': team.brawlers.length == 3,
        }"
        class="brawler-avatar"
      >
        <media-img
          :path="`/brawlers/${brawlerId({ name: brawler })}/avatar`"
          :alt="brawler"
          size="160"
          clazz="brawler-avatar__img"
        ></media-img>
      </router-link>
      <p class="brawler-avatar__stats">
        {{ metaStatMaps.formatters.wins(team.wins) }}
        {{ metaStatMaps.labelsShort.wins }}
      </p>
    </div>
    <p v-if="!$fetchState.pending && teams.length == 0">
      No data.
    </p>
  </div>
</template>

<script lang="ts">
import { mapState } from 'vuex'
import Vue, { PropType } from 'vue'
import { MetaInfo } from 'vue-meta'
import { brawlerId, capitalizeWords, metaStatMaps } from '~/lib/util'

interface Team {
  id: string
  brawlers: string[]
  wins: number
  winRate: number
}

export default Vue.extend({
  props: {
    map: {
      type: String,
    },
    mode: {
      type: String,
    },
    season: {
      type: String,
    },
    limit: {
      type: Number,
      default: 2,
    },
  },
  data() {
    return {
      teams: [] as Team[],
    }
  },
  watch: {
    map: '$fetch',
    mode: '$fetch',
    season: '$fetch',
  },
  fetchDelay: 0,
  async fetch() {
    const slices = {
      ...this.$clicker.defaultSlices('synergy'),
      ...(this.map != undefined ? {
        battle_event_map: [this.map],
      } : {}),
      ...(this.mode != undefined ? {
        battle_event_mode: [this.mode],
      } : {}),
      ...(this.season != undefined ? {
        trophy_season_end: undefined,
        trophy_season_end_exact: [this.season],
      } : {}),
    }
    this.teams = []

    const data = await this.$clicker.query('meta.map.best-teams', 'team', ['brawler_names'], ['picks', 'wins', 'battle_victory'], slices, {
      cache: 60*15,
      sort: { wins: 'desc' },
      limit: this.limit,
    })
    this.teams = data.data.map((t) => (<Team>{
      id: t.brawler_names.join('+'),
      brawlers: t.brawler_names,
      wins: Math.floor(t.wins),
      winRate: t.wins / t.picks,
    }))
  },
  computed: {
    brawlerId() {
      return brawlerId
    },
    metaStatMaps() {
      return metaStatMaps
    },
    ...mapState({
      totalBrawlers: (state: any) => state.totalBrawlers,
    })
  },
})
</script>
