/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PublicAppInfo } from 'opensearch-dashboards/public';
import { fireEvent, render, waitFor, act } from '@testing-library/react';
import { BehaviorSubject } from 'rxjs';
import { WorkspaceCreator as WorkspaceCreatorComponent } from './workspace_creator';
import { coreMock } from '../../../../../core/public/mocks';
import { createOpenSearchDashboardsReactContext } from '../../../../opensearch_dashboards_react/public';

const workspaceClientCreate = jest
  .fn()
  .mockReturnValue({ result: { id: 'successResult' }, success: true });

const navigateToApp = jest.fn();
const notificationToastsAddSuccess = jest.fn();
const notificationToastsAddDanger = jest.fn();
const PublicAPPInfoMap = new Map([
  ['data-explorer', { id: 'data-explorer', title: 'Data Explorer' }],
  ['dashboards', { id: 'dashboards', title: 'Dashboards' }],
]);

const dataSourcesList = [
  {
    id: 'id1',
    title: 'ds1',
    // This is used for mocking saved object function
    get: () => {
      return 'ds1';
    },
  },
  {
    id: '2',
    title: 'ds2',
    get: () => {
      return 'ds2';
    },
  },
];

const mockCoreStart = coreMock.createStart();

const WorkspaceCreator = (props: any) => {
  const { Provider } = createOpenSearchDashboardsReactContext({
    ...mockCoreStart,
    ...{
      application: {
        ...mockCoreStart.application,
        capabilities: {
          ...mockCoreStart.application.capabilities,
          workspaces: {
            permissionEnabled: true,
          },
        },
        navigateToApp,
        getUrlForApp: jest.fn(() => '/app/workspace_overview'),
        applications$: new BehaviorSubject<Map<string, PublicAppInfo>>(PublicAPPInfoMap as any),
      },
      notifications: {
        ...mockCoreStart.notifications,
        toasts: {
          ...mockCoreStart.notifications.toasts,
          addDanger: notificationToastsAddDanger,
          addSuccess: notificationToastsAddSuccess,
        },
      },
      workspaceClient: {
        ...mockCoreStart.workspaces,
        create: workspaceClientCreate,
      },
      savedObjects: {
        ...mockCoreStart.savedObjects,
        client: {
          ...mockCoreStart.savedObjects.client,
          find: jest.fn().mockResolvedValue({
            savedObjects: dataSourcesList,
          }),
        },
      },
    },
  });

  return (
    <Provider>
      <WorkspaceCreatorComponent {...props} />
    </Provider>
  );
};

function clearMockedFunctions() {
  workspaceClientCreate.mockClear();
  notificationToastsAddDanger.mockClear();
  notificationToastsAddSuccess.mockClear();
}

describe('WorkspaceCreator', () => {
  beforeEach(() => clearMockedFunctions());
  const { location } = window;
  const setHrefSpy = jest.fn((href) => href);

  beforeAll(() => {
    if (window.location) {
      // @ts-ignore
      delete window.location;
    }
    window.location = {} as Location;
    Object.defineProperty(window.location, 'href', {
      get: () => 'http://localhost/w/workspace/app/workspace_create',
      set: setHrefSpy,
    });
  });

  afterAll(() => {
    window.location = location;
  });

  it('should not create workspace when name is empty', async () => {
    const { getByTestId } = render(
      <WorkspaceCreator
        workspaceConfigurableApps$={new BehaviorSubject([...PublicAPPInfoMap.values()])}
      />
    );
    fireEvent.click(getByTestId('workspaceForm-bottomBar-createButton'));
    expect(workspaceClientCreate).not.toHaveBeenCalled();
  });

  it('should not create workspace with invalid name', async () => {
    const { getByTestId } = render(
      <WorkspaceCreator
        workspaceConfigurableApps$={new BehaviorSubject([...PublicAPPInfoMap.values()])}
      />
    );
    const nameInput = getByTestId('workspaceForm-workspaceDetails-nameInputText');
    fireEvent.input(nameInput, {
      target: { value: '~' },
    });
    expect(workspaceClientCreate).not.toHaveBeenCalled();
  });

  it('should not create workspace without use cases', async () => {
    setHrefSpy.mockReset();
    const { getByTestId } = render(
      <WorkspaceCreator
        workspaceConfigurableApps$={new BehaviorSubject([...PublicAPPInfoMap.values()])}
      />
    );
    const nameInput = getByTestId('workspaceForm-workspaceDetails-nameInputText');
    fireEvent.input(nameInput, {
      target: { value: 'test workspace name' },
    });
    expect(setHrefSpy).not.toHaveBeenCalled();
    fireEvent.click(getByTestId('workspaceForm-bottomBar-createButton'));
    expect(workspaceClientCreate).not.toHaveBeenCalled();
  });

  it('cancel create workspace', async () => {
    const { findByText, getByTestId } = render(
      <WorkspaceCreator
        workspaceConfigurableApps$={new BehaviorSubject([...PublicAPPInfoMap.values()])}
      />
    );
    fireEvent.click(getByTestId('workspaceForm-bottomBar-cancelButton'));
    await findByText('Discard changes?');
    fireEvent.click(getByTestId('confirmModalConfirmButton'));
    expect(navigateToApp).toHaveBeenCalled();
  });

  it('create workspace with detailed information', async () => {
    const { getByTestId } = render(
      <WorkspaceCreator
        workspaceConfigurableApps$={new BehaviorSubject([...PublicAPPInfoMap.values()])}
      />
    );
    const nameInput = getByTestId('workspaceForm-workspaceDetails-nameInputText');
    fireEvent.input(nameInput, {
      target: { value: 'test workspace name' },
    });
    const descriptionInput = getByTestId('workspaceForm-workspaceDetails-descriptionInputText');
    fireEvent.input(descriptionInput, {
      target: { value: 'test workspace description' },
    });
    const colorSelector = getByTestId(
      'euiColorPickerAnchor workspaceForm-workspaceDetails-colorPicker'
    );
    fireEvent.input(colorSelector, {
      target: { value: '#000000' },
    });
    fireEvent.click(getByTestId('workspaceUseCase-observability'));
    fireEvent.click(getByTestId('workspaceForm-bottomBar-createButton'));
    expect(workspaceClientCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'test workspace name',
        color: '#000000',
        description: 'test workspace description',
        features: expect.arrayContaining(['use-case-observability']),
      }),
      { dataSources: [], permissions: undefined }
    );
    await waitFor(() => {
      expect(notificationToastsAddSuccess).toHaveBeenCalled();
    });
    expect(notificationToastsAddDanger).not.toHaveBeenCalled();
  });

  it('should show danger toasts after create workspace failed', async () => {
    workspaceClientCreate.mockReturnValueOnce({ result: { id: 'failResult' }, success: false });
    const { getByTestId } = render(
      <WorkspaceCreator
        workspaceConfigurableApps$={new BehaviorSubject([...PublicAPPInfoMap.values()])}
      />
    );
    const nameInput = getByTestId('workspaceForm-workspaceDetails-nameInputText');
    fireEvent.input(nameInput, {
      target: { value: 'test workspace name' },
    });
    fireEvent.click(getByTestId('workspaceUseCase-observability'));
    fireEvent.click(getByTestId('workspaceForm-bottomBar-createButton'));
    expect(workspaceClientCreate).toHaveBeenCalled();
    await waitFor(() => {
      expect(notificationToastsAddDanger).toHaveBeenCalled();
    });
    expect(notificationToastsAddSuccess).not.toHaveBeenCalled();
  });

  it('should show danger toasts after call create workspace API failed', async () => {
    workspaceClientCreate.mockImplementationOnce(async () => {
      throw new Error();
    });
    const { getByTestId } = render(
      <WorkspaceCreator
        workspaceConfigurableApps$={new BehaviorSubject([...PublicAPPInfoMap.values()])}
      />
    );
    const nameInput = getByTestId('workspaceForm-workspaceDetails-nameInputText');
    fireEvent.input(nameInput, {
      target: { value: 'test workspace name' },
    });
    fireEvent.click(getByTestId('workspaceUseCase-observability'));
    fireEvent.click(getByTestId('workspaceForm-bottomBar-createButton'));
    expect(workspaceClientCreate).toHaveBeenCalled();
    await waitFor(() => {
      expect(notificationToastsAddDanger).toHaveBeenCalled();
    });
    expect(notificationToastsAddSuccess).not.toHaveBeenCalled();
  });

  it('create workspace with customized permissions', async () => {
    const { getByTestId, getAllByText } = render(
      <WorkspaceCreator
        workspaceConfigurableApps$={new BehaviorSubject([...PublicAPPInfoMap.values()])}
      />
    );
    const nameInput = getByTestId('workspaceForm-workspaceDetails-nameInputText');
    fireEvent.input(nameInput, {
      target: { value: 'test workspace name' },
    });
    fireEvent.click(getByTestId('workspaceUseCase-observability'));
    fireEvent.click(getByTestId('workspaceForm-permissionSettingPanel-user-addNew'));
    const userIdInput = getAllByText('Select')[0];
    fireEvent.click(userIdInput);
    fireEvent.input(getByTestId('comboBoxSearchInput'), {
      target: { value: 'test user id' },
    });
    fireEvent.blur(getByTestId('comboBoxSearchInput'));
    fireEvent.click(getByTestId('workspaceForm-bottomBar-createButton'));
    expect(workspaceClientCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'test workspace name',
      }),
      {
        dataSources: [],
        permissions: {
          read: {
            users: ['test user id'],
          },
          library_read: {
            users: ['test user id'],
          },
        },
      }
    );
    await waitFor(() => {
      expect(notificationToastsAddSuccess).toHaveBeenCalled();
    });
    expect(notificationToastsAddDanger).not.toHaveBeenCalled();
  });

  it('create workspace with customized selected dataSources', async () => {
    const { getByTestId, getByTitle, getByText } = render(
      <WorkspaceCreator
        workspaceConfigurableApps$={new BehaviorSubject([...PublicAPPInfoMap.values()])}
      />
    );
    const nameInput = getByTestId('workspaceForm-workspaceDetails-nameInputText');
    fireEvent.input(nameInput, {
      target: { value: 'test workspace name' },
    });
    fireEvent.click(getByTestId('workspaceUseCase-observability'));
    fireEvent.click(getByTestId('workspaceForm-select-dataSource-addNew'));
    fireEvent.click(getByTestId('workspaceForm-select-dataSource-comboBox'));
    await act(() => {
      fireEvent.click(getByText('Select'));
    });
    fireEvent.click(getByTitle(dataSourcesList[0].title));

    fireEvent.click(getByTestId('workspaceForm-bottomBar-createButton'));
    expect(workspaceClientCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'test workspace name',
      }),
      {
        dataSources: ['id1'],
        permissions: undefined,
      }
    );
    await waitFor(() => {
      expect(notificationToastsAddSuccess).toHaveBeenCalled();
    });
    expect(notificationToastsAddDanger).not.toHaveBeenCalled();
  });
});
