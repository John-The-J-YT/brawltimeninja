<template>
  <div class="page container">
    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'title'),
        once: true,
      }"
    >
      <h1 class="page-h1">Brawl Stars Brawler Tier List</h1>
      <p>Brawler Tier Lists are generated automatically for all Brawlers in Brawl Stars.</p>
    </div>

    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'gadgets'),
        once: true,
      }"
    >
      <h2 class="page-h2">Gadget and Star Power Tier List</h2>
    </div>

    <div class="section flex flex-wrap justify-center">
      <best-starpowers-card
        kind="starpowers"
      ></best-starpowers-card>

      <best-starpowers-card
        kind="gadgets"
      ></best-starpowers-card>
    </div>

    <client-only>
      <adsense
        id="ezoic-pub-ad-placeholder-107"
        ins-class="ad-section"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="9201379700"
        data-ad-format="auto"
        data-full-width-responsive="yes"
      />
    </client-only>

    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'modes'),
        once: true,
      }"
    >
      <h2 class="page-h2">Mode Tier Lists</h2>
      <p>Open a Mode to view the Tier List for it.</p>
    </div>

    <div class="section">
      <div class="overflow-x-auto flex md:flex-wrap md:justify-center">
        <div
          v-for="(mode, index) in modes"
          :key="mode"
          :class="{ 'md:hidden': !showAllModes && index >= 3 }"
          class="mx-2"
        >
          <map-best-brawlers-card
            :mode="mode"
            link
          ></map-best-brawlers-card>
        </div>
      </div>

      <div class="mt-2 w-full text-right hidden md:block">
        <button
          v-show="!showAllModes"
          class="button button--md button--secondary"
          @click="showAllModes = true; $ga.event('brawler_meta', 'load_more')"
        >
          Show All Modes
        </button>
      </div>
    </div>

    <client-only>
      <adsense
        v-if="!isApp"
        ins-class="ad-section"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="6446102315"
        data-ad-format="auto"
        data-full-width-responsive="yes"
      />
    </client-only>

    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'widget'),
        once: true,
      }"
    >
      <h2 class="page-h2">State of the Meta</h2>
      <p>
        Curious about the past?
        <nuxt-link
          to="/tier-list/history"
          class="link"
        >Explore the Time Capsule.</nuxt-link>
      </p>
    </div>

    <div
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'widget'),
        once: true,
      }"
      class="section flex justify-center"
    >
      <map-detail-card></map-detail-card>
    </div>

    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'stats'),
        once: true,
      }"
    >
      <h2 class="page-h2">Tier List for all Maps and Modes</h2>
    </div>

    <meta-slicers
      v-model="slices"
      :sample="totalSampleSize"
      :sample-min="100000"
      :timestamp="totalTimestamp"
      :loading="$fetchState.pending"
      cube="map"
      class="mx-auto"
    ></meta-slicers>

    <meta-views
      v-if="totalSampleSize > 0"
      :entries="entries"
      :measurements="['winRate', 'wins', 'useRate', 'pickRate', 'starRate', 'rank1Rate', 'duration']"
      :description="description"
      ga-category="brawler_meta"
      @measurements="ms => selectedMeasurements = ms"
    ></meta-views>

    <client-only>
      <adsense
        v-if="!isApp"
        ins-class="ad-section"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="7838173054"
        data-ad-format="auto"
        data-full-width-responsive="yes"
      />
    </client-only>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { MetaGridEntry, brawlerId, capitalize, capitalizeWords, measurementMap, measurementOfTotal } from '../../../lib/util'

export default Vue.extend({
  head() {
    const description = 'Brawl Stars Brawler Tier List. Find the best Brawlers. View Win Rates and Rankings.'
    return {
      title: 'Brawler Tier List',
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  data() {
    return {
      modes: [] as string[],
      showAllModes: false,
      slices: this.$clicker.defaultSlices('map'),
      entries: [] as MetaGridEntry[],
      selectedMeasurements: ['winRateAdj'],
      totalSampleSize: 0,
      totalTimestamp: undefined as undefined|string,
    }
  },
  computed: {
    description(): string {
      return this.$clicker.describeSlices(this.slices, this.totalTimestamp)
    },
    ...mapState({
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
  watch: {
    slices: '$fetch',
    selectedMeasurements: '$fetch',
  },
  fetchDelay: 0,
  async fetch() {
    const data = await this.$clicker.query('meta.brawler', 'map',
      ['brawler_name'],
      [...this.selectedMeasurements.map(m => measurementMap[m]), 'picks', 'timestamp'],
      this.slices,
      { sort: { picks: 'desc' }, cache: 60*60 })

    this.entries = data.data.map(row => ({
      id: row.brawler_name,
      brawler: row.brawler_name,
      title: capitalizeWords(row.brawler_name.toLowerCase()),
      stats: this.selectedMeasurements.reduce((stats, m) => ({
        ...stats,
        [m]: row[measurementMap[m]] / (measurementOfTotal[m] ? data.totals[measurementMap[m]] : 1),
      }), {} as Record<string, number>),
      sampleSize: row.picks,
      link: `/tier-list/brawler/${brawlerId({ name: row.brawler_name })}`,
    }) as MetaGridEntry)
    this.totalSampleSize = data.totals.picks
    this.totalTimestamp = data.totals.timestamp
  },
  async asyncData({ $clicker }) {
    const modes = await $clicker.queryAllModes()

    return {
      modes,
    }
  },
  methods: {
    trackScroll(visible: boolean, element: any, section: string): void {
      if (visible) {
        this.$ga.event('brawler_meta', 'scroll', section)
      }
    },
  },
})
</script>
