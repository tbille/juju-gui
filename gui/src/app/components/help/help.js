/* Copyright (C) 2017 Canonical Ltd. */

'use strict';

const PropTypes = require('prop-types');
const React = require('react');

const Lightbox = require('../lightbox/lightbox');
const {SvgIcon} = require('@canonical/juju-react-components');
const VanillaCard = require('../vanilla/card/card');
const Tour = require('./tour/tour');

require('./_help.scss');

class Help extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      jujuShow: null,
      tour: false
    };
    this.analytics = this.props.analytics.addCategory('Help');
  }

  componentWillMount() {
    if (!this.props.youtubeAPIKey) {
      return;
    }
    this.getJujuShow = this.props.sendGetRequest(
      `https://www.googleapis.com/youtube/v3/search\
?part=snippet&channelId=UCSsoSZBAZ3Ivlbt_fxyjIkw\
&maxResults=1&order=date&type=video&key=\
${this.props.youtubeAPIKey}`,
      {},
      null,
      null,
      null,
      response => {
        try {
          const data = JSON.parse(response.currentTarget.response);
          const jujuShow = {
            title: data.items[0].snippet.title,
            thumbnail: data.items[0].snippet.thumbnails.medium,
            videoId: data.items[0].id.videoId
          };
          this.setState({jujuShow: jujuShow});
        } catch (_) {
          // Don't do anything. The jujushow is a nice addition but not
          // required.
        }
      }
    );
  }

  componentDidMount() {
    this.analytics.sendEvent(this.props.analytics.VIEW);
  }

  _handleClose() {
    this.props.changeState({
      help: null
    });
    this.analytics.addCategory('Close').sendEvent(this.props.analytics.CLICK);
  }

  _startTour() {
    this.setState({
      tour: true
    });
    this.analytics.addCategory('Start Tour').sendEvent(this.props.analytics.CLICK);
  }

  _endTour() {
    this.setState({
      tour: false
    });
    this.analytics.addCategory('End Tour').sendEvent(this.props.analytics.CLICK);
  }

  /**
   Click the button, get the shortcuts.

   @param {Object} evt The click event.
  */
  _handleShortcutsLink(evt) {
    this.analytics.addCategory('Shortcuts').sendEvent(this.props.analytics.CLICK);
    evt.stopPropagation();
    this._handleClose();
    this.props.displayShortcutsModal();
  }

  /**
    Generate a link to issues based on whether the user is logged in and in gisf.
    @returns {Object} The React object for the issues link.
   */
  _generateIssuesLink() {
    let label = 'File Issue';
    let link = 'https://github.com/juju/juju-gui/issues';
    const props = this.props;
    if (props.user) {
      label = 'Get support';
      link = props.gisf ? 'https://jujucharms.com/support' :
        'https://jujucharms.com/docs/stable/about-juju';
    }
    return (
      <a
        className="link"
        href={link}
        target="_blank">{label}</a>);
  }

  _generateJujuShow() {
    if (!this.state.jujuShow) {
      return null;
    }
    return (
      <a
        className="four-col juju-show"
        href={`https://youtube.com/watch?v=${this.state.jujuShow.videoId}`}
        target="_blank">
        <img
          className="juju-show__image"
          src={this.state.jujuShow.thumbnail.url} />
        <p>
          <b>The Juju show</b>
          <span
            className="juju-show__title"
            title={this.state.jujuShow.title}>
            {this.state.jujuShow.title}
          </span>
        </p>
      </a>
    );
  }

  render() {
    if (this.state.tour) {
      return (
        <Tour
          close={this._handleClose.bind(this)}
          endTour={this._endTour.bind(this)}
          staticURL={this.props.staticURL} />
      );
    }

    const staticURL = this.props.staticURL;
    const basePath = `${staticURL}/assets/images/non-sprites/tour`;

    return (<Lightbox
      close={this._handleClose.bind(this)}
      extraClasses={['help']}>
      <div className="help__body">
        <header className="help__header clearfix">
          <h3 className="help__header-title">Help</h3>
          <div className="help__header-search header-search">
            <form
              action="https://jujucharms.com/docs/search/"
              className="header-search__form"
              target="_blank">
              <span className="v1">
                <button
                  className="header-search__submit"
                  type="submit">
                  <SvgIcon
                    name="search_16"
                    size="16" />
                </button>
              </span>
              <input
                className="header-search__input"
                name="text"
                placeholder="Search the docs"
                ref={input => {this.searchDocs = input;}}
                type="search" />
            </form>
          </div>
        </header>
        <div className="help__content clearfix">
          <VanillaCard
            title="Getting started">
            <p>
              <a
                className="link"
                href="https://jujucharms.com/docs/stable/getting-started"
                target="_blank">Read the {this.props.gisf ? 'JAAS' : 'Juju'} docs
              </a>.
            </p>
          </VanillaCard>
          <VanillaCard
            title="Tutorials">
            <p>Learn how to operate production-ready clusters.</p>
            <p>
              <a
                className="link charm-row"
                href="https://tutorials.ubuntu.com/tutorial/get-started-canonical-kubernetes"
                target="_blank">
                <img
                  alt="Kubernetes logo"
                  src={'https://api.jujucharms.com/charmstore/v5/~containers/' +
                  'kubernetes-master-55/icon.svg'}
                  width="24" />
                Kubernetes tutorial</a>
            </p>
            <p>
              <a
                className="link charm-row"
                href="https://tutorials.ubuntu.com/tutorial/get-started-hadoop-spark"
                target="_blank">
                <img
                  alt="Hadoop Spark logo"
                  src={'https://api.jujucharms.com/charmstore/v5/xenial/' +
                  'hadoop-client-8/icon.svg'}
                  width="24" />
                Hadoop Spark tutorial</a>
            </p>
          </VanillaCard>
          <VanillaCard
            title="Take a tour">
            <p>
              <img
                className="help__tour-image"
                src={`${basePath}/help@1x.png`}
                srcSet={`${basePath}/help@2x.png 2x`}
                width="201" />
              <span
                className="link"
                onClick={this._startTour.bind(this)}
                role="button">
                Learn how to use the canvas.
              </span>
            </p>
          </VanillaCard>
        </div>
        <footer className="help__footer clearfix">
          <div className="four-col">
            <p>
              <span
                className="link"
                onClick={this._handleShortcutsLink.bind(this)}
                role="button">
                Keyboard shortcuts
              </span>
            </p>
            <p>
              <a
                className="link"
                href="https://jujucharms.com/how-it-works#frequently-asked-questions"
                target="_blank">
                FAQs
              </a>
            </p>
            <p>
              {this._generateIssuesLink()}
            </p>
          </div>
          {this._generateJujuShow()}
          <div className="four-col last-col">
            <p>IRC channels on Freenode</p>
            <p>
              <a
                className="link external"
                href="http://webchat.freenode.net/?channels=%23juju"
                target="_blank">
                #juju
              </a>
            </p>
            <p>Forum</p>
            <p>
              <a
                className="link external"
                href="https://discourse.jujucharms.com/"
                target="_blank">
                Juju Discourse
              </a>
            </p>
          </div>
        </footer>
      </div>
    </Lightbox>);
  }
}

Help.propTypes = {
  analytics: PropTypes.object.isRequired,
  changeState: PropTypes.func.isRequired,
  displayShortcutsModal: PropTypes.func.isRequired,
  gisf: PropTypes.bool.isRequired,
  sendGetRequest: PropTypes.func.isRequired,
  staticURL: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired,
  youtubeAPIKey: PropTypes.string
};

module.exports = Help;
