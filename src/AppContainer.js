import React, { Component, PropTypes } from 'react'
import { Route, IndexRoute } from 'react-router'
import { BrowserRouter as Router } from 'react-router-dom'
import Helmet from 'react-helmet'
import Header from './Header'
import Home from './Home'
import StatementJustificationsContainer from './StatementJustificationsContainer'

export default class AppContainer extends Component {
  render () {
    return (
      <Router>
        <div id="app">
          <Helmet title="Howdju" />

          <Header/>

          <Route exact path="/" component={Home} />
          <Route path="/s/:statementId/:statementSlug" component={StatementJustificationsContainer} />

        </div>
      </Router>
    )
  }
}
