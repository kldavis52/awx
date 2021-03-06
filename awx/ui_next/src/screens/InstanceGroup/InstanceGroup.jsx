import React, { useEffect, useCallback } from 'react';
import {
  Link,
  Redirect,
  Route,
  Switch,
  useLocation,
  useParams,
} from 'react-router-dom';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { CaretLeftIcon } from '@patternfly/react-icons';
import { Card, PageSection } from '@patternfly/react-core';

import useRequest from '../../util/useRequest';
import { InstanceGroupsAPI } from '../../api';
import RoutedTabs from '../../components/RoutedTabs';
import ContentError from '../../components/ContentError';
import ContentLoading from '../../components/ContentLoading';

import InstanceGroupDetails from './InstanceGroupDetails';
import InstanceGroupEdit from './InstanceGroupEdit';
import Jobs from './Jobs';
import Instances from './Instances';

function InstanceGroup({ i18n, setBreadcrumb }) {
  const { id } = useParams();
  const { pathname } = useLocation();

  const {
    isLoading,
    error: contentError,
    request: fetchInstanceGroups,
    result: instanceGroup,
  } = useRequest(
    useCallback(async () => {
      const { data } = await InstanceGroupsAPI.readDetail(id);
      return data;
    }, [id])
  );

  useEffect(() => {
    fetchInstanceGroups();
  }, [fetchInstanceGroups, pathname]);

  useEffect(() => {
    if (instanceGroup) {
      setBreadcrumb(instanceGroup);
    }
  }, [instanceGroup, setBreadcrumb]);

  const tabsArray = [
    {
      name: (
        <>
          <CaretLeftIcon />
          {i18n._(t`Back to instance groups`)}
        </>
      ),
      link: '/instance_groups',
      id: 99,
    },
    {
      name: i18n._(t`Details`),
      link: `/instance_groups/${id}/details`,
      id: 0,
    },
    {
      name: i18n._(t`Instances`),
      link: `/instance_groups/${id}/instances`,
      id: 1,
    },
    {
      name: i18n._(t`Jobs`),
      link: `/instance_groups/${id}/jobs`,
      id: 2,
    },
  ];

  if (!isLoading && contentError) {
    return (
      <PageSection>
        <Card>
          <ContentError error={contentError}>
            {contentError.response?.status === 404 && (
              <span>
                {i18n._(t`Instance group not found.`)}
                {''}
                <Link to="/instance_groups">
                  {i18n._(t`View all instance groups`)}
                </Link>
              </span>
            )}
          </ContentError>
        </Card>
      </PageSection>
    );
  }

  let cardHeader = <RoutedTabs tabsArray={tabsArray} />;
  if (pathname.endsWith('edit')) {
    cardHeader = null;
  }

  return (
    <PageSection>
      <Card>
        {cardHeader}
        {isLoading && <ContentLoading />}
        {!isLoading && instanceGroup && (
          <Switch>
            <Redirect
              from="/instance_groups/:id"
              to="/instance_groups/:id/details"
              exact
            />
            {instanceGroup && (
              <>
                <Route path="/instance_groups/:id/edit">
                  <InstanceGroupEdit instanceGroup={instanceGroup} />
                </Route>
                <Route path="/instance_groups/:id/details">
                  <InstanceGroupDetails instanceGroup={instanceGroup} />
                </Route>
                <Route path="/instance_groups/:id/instances">
                  <Instances />
                </Route>
                <Route path="/instance_groups/:id/jobs">
                  <Jobs />
                </Route>
              </>
            )}
          </Switch>
        )}
      </Card>
    </PageSection>
  );
}

export default withI18n()(InstanceGroup);
