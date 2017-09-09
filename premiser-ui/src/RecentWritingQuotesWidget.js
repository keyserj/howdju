import React, {Component} from 'react'

import ListEntitiesWidget from './ListEntitiesWidget'
import ExpandableChildContainer from './ExpandableChildContainer'
import WritQuoteCard from './WritQuoteCard'
import {default as t} from './texts'
import {
  api,
  ui,
} from './actions'
import {writQuotesSchema} from "./schemas"

export default class RecentWritQuotesWidget extends Component {

  writQuoteToCard = writQuote => {
    const id = this.props.id
    const cardId = `${id}-writ-reference-${writQuote.id}`
    return (
      <ExpandableChildContainer ExpandableChildComponent={WritQuoteCard}
                                widgetId={cardId}
                                key={cardId}
                                writQuote={writQuote}
                                className={ListEntitiesWidget.smallCellClasses}
      />
    )

  }

  render() {
    const {
      id,
      widgetId,
      ...rest
    } = this.props
    return (
      <ListEntitiesWidget {...rest}
                          id={id}
                          widgetId={widgetId}
                          entitiesWidgetStateKey="recentWritQuotes"
                          clearEntities={ui.clearRecentWritQuotes}
                          fetchEntities={api.fetchRecentWritQuotes}
                          entityToCard={this.writQuoteToCard}
                          entitiesSchema={writQuotesSchema}
                          emptyEntitiesMessage={t("No recent quotes")}
                          loadErrorMessage={t("There was an error fetching the recent quotes.")}
      />
    )
  }
}
