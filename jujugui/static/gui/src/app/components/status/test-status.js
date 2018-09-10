/* Copyright (C) 2017 Canonical Ltd. */
'use strict';

const React = require('react');
const enzyme = require('enzyme');
const shapeup = require('shapeup');

const Status = require('./status');

describe('Status', function() {
  let changeState;
  let model;
  let db;
  let generatePath;
  const propTypes = Status.propTypes;

  const renderComponent = (options = {}) => enzyme.shallow(
    <Status
      changeState={options.changeState || changeState}
      db={shapeup.fromShape(options.db || db, propTypes.db)}
      generatePath={options.generatePath || generatePath}
      model={shapeup.fromShape(options.model || model, propTypes.model)} />
  );

  beforeEach(() => {
    changeState = sinon.stub();
    model = {
      cloud: 'aws',
      environmentName: 'my-model',
      modelUUID: 'myuuid',
      region: 'neutral zone',
      sla: 'advanced',
      version: '2.42.47'
    };
    db = {
      machines: {
        filter: sinon.stub().returns([{}]),
        toArray: sinon.stub().withArgs().returns([])
      },
      relations: {
        filter: sinon.stub().returns([{}]),
        toArray: sinon.stub().withArgs().returns([])
      },
      remoteServices: {
        map: sinon.stub().returns([{}]),
        toArray: sinon.stub().withArgs().returns([])
      },
      services: {
        filter: sinon.stub().returns([{}]),
        getById: sinon.stub(),
        toArray: sinon.stub().withArgs().returns([])
      },
      units: {
        filter: sinon.stub().returns([{}]),
        toArray: sinon.stub().withArgs().returns([])
      }
    };
    generatePath = sinon.stub();
  });

  it('renders with no data', () => {
    const model = {};
    const wrapper = renderComponent({
      db: db,
      model
    });
    const expected = (
      <div className="status-view__content">
        Cannot show the status: the GUI is not connected to a model.
      </div>
    );
    assert.compareJSX(wrapper.find('.status-view__content'), expected);
  });

  it('renders with no entities', () => {
    db.machines.filter.returns([]);
    db.relations.filter.returns([]);
    db.remoteServices.map.returns([]);
    db.services.filter.returns([]);
    db.units.filter.returns([]);
    const wrapper = renderComponent();
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with entities', () => {
    const wrapper = renderComponent();
    expect(wrapper).toMatchSnapshot();
  });

  it('can navigate to charms from the app list', () => {
    const wrapper = renderComponent();
    const section = wrapper.find('StatusApplicationList');
    section.props().onCharmClick('u/who/django/xenial/42', { preventDefault: sinon.stub() });
    assert.equal(changeState.callCount, 1);
    assert.deepEqual(
      changeState.args[0][0], {store: 'u/who/django/xenial/42'});
  });

  it('can navigate to apps from the relation list', () => {
    const wrapper = renderComponent();
    const section = wrapper.find('StatusRelationList');
    section.props().onApplicationClick('mysql', { preventDefault: sinon.stub() });
    assert.equal(changeState.callCount, 1);
    assert.deepEqual(changeState.args[0][0], {
      gui: {
        inspector: {
          id: 'mysql',
          activeComponent: undefined,
          unit: null,
          unitStatus: null
        }
      }
    });
  });

  it('can filter by status', () => {
    const wrapper = renderComponent();
    wrapper.find('select').simulate('change', {currentTarget: {value: 'error'}});
    const instance = wrapper.instance();
    assert.equal(instance.state.statusFilter, 'error');
  });

  it('can filter by nothing', () => {
    const wrapper = renderComponent();
    wrapper.find('select').simulate('change', {currentTarget: {value: 'none'}});
    const instance = wrapper.instance();
    assert.equal(instance.state.filter, null);
  });

  it('can show a highest status notification', () => {
    db.units.toArray.returns([{ agentStatus: 'error' }]);
    const wrapper = renderComponent({ db });
    assert.equal(
      wrapper.find('.status-view__traffic-light').prop('className').includes(
        'status-view__traffic-light--error'),
      true);
  });
});
