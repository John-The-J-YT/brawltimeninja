import Vue, { PropType } from 'vue'
import { StarpowerMetaStatistics } from '~/model/Api'
import { metaStatMaps } from '~/lib/util'

// TODO this is copy-pasted from brawler-gadget-stats
export default Vue.extend({
  functional: true,
  props: {
    starpowerMeta: {
      type: Array as PropType<StarpowerMetaStatistics[]>,
      required: true,
    },
    brawlerId: {
      type: String,
      required: true
    },
  },
  render(h, { props }) {
    const brawlerId = props.brawlerId
    // TODO update brawler endpoint to return this data
    const starpowers = props.starpowerMeta
        .filter(entry => entry.brawlerName === brawlerId)
        .sort((e1, e2) => e2.sampleSize - e1.sampleSize)

    return starpowers.map(starpower =>
        <div key={starpower.id} class="card-wrapper">
          <div class="card prop-card prop-card-md w-48 bg-gray-800">
            <span class="prop-card-title capitalize">
              { starpower.starpowerName.length > 0 ? starpower.starpowerName.toLowerCase() : 'No Gadget' }
            </span>
            { starpower.starpowerName.length > 0 ?
            <media-img
              path={'/starpowers/' + starpower.id}
              size="96"
              clazz="prop-card-image"
            ></media-img>
            :
            <media-img
              path={'/brawlers/' + brawlerId + '/avatar'}
              size="96"
              clazz="prop-card-image"
            ></media-img>
            }
            <dl class="prop-card-content prop-card-content-md">
              <div>
                <span class="card-prop-icon">
                  { metaStatMaps.icons.winRate }
                </span>
                <dd class="card-prop-value inline">
                  { metaStatMaps.formatters.winRate(starpower.stats.winRate) }
                </dd>
              </div>
              <dt class="text-sm">
                { metaStatMaps.labels.winRate }
              </dt>
            </dl>
          </div>
        </div>
    )
  }
})
