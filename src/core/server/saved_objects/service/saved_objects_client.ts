/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { ISavedObjectsRepository } from './lib';
import {
  SavedObject,
  SavedObjectError,
  SavedObjectReference,
  SavedObjectsMigrationVersion,
  SavedObjectsBaseOptions,
  MutatingOperationRefreshSetting,
  SavedObjectsFindOptions,
} from '../types';
import { SavedObjectsErrorHelpers } from './lib/errors';
import { Permissions } from '../permission_control';

/**
 *
 * @public
 */
export interface SavedObjectsCreateOptions extends SavedObjectsBaseOptions {
  /** (not recommended) Specify an id for the document */
  id?: string;
  /** Overwrite existing documents (defaults to false) */
  overwrite?: boolean;
  /**
   * An opaque version number which changes on each successful write operation.
   * Can be used in conjunction with `overwrite` for implementing optimistic concurrency control.
   **/
  version?: string;
  /** {@inheritDoc SavedObjectsMigrationVersion} */
  migrationVersion?: SavedObjectsMigrationVersion;
  references?: SavedObjectReference[];
  /** The OpenSearch Refresh setting for this operation */
  refresh?: MutatingOperationRefreshSetting;
  /** Optional ID of the original saved object, if this object's `id` was regenerated */
  originId?: string;
  /**
   * Optional initial namespaces for the object to be created in. If this is defined, it will supersede the namespace ID that is in
   * {@link SavedObjectsCreateOptions}.
   *
   * Note: this can only be used for multi-namespace object types.
   */
  initialNamespaces?: string[];
  /** permission control describe by ACL object */
  permissions?: Permissions;
}

/**
 *
 * @public
 */
export interface SavedObjectsBulkCreateObject<T = unknown> {
  id?: string;
  type: string;
  attributes: T;
  version?: string;
  references?: SavedObjectReference[];
  /** {@inheritDoc SavedObjectsMigrationVersion} */
  migrationVersion?: SavedObjectsMigrationVersion;
  /** Optional ID of the original saved object, if this object's `id` was regenerated */
  originId?: string;
  /**
   * Optional initial namespaces for the object to be created in. If this is defined, it will supersede the namespace ID that is in
   * {@link SavedObjectsCreateOptions}.
   *
   * Note: this can only be used for multi-namespace object types.
   */
  initialNamespaces?: string[];
  /**
   * workspaces the objects belong to, will only be used when overwrite is enabled.
   */
  workspaces?: SavedObject['workspaces'];
}

/**
 *
 * @public
 */
export interface SavedObjectsBulkUpdateObject<T = unknown>
  extends Pick<SavedObjectsUpdateOptions, 'version' | 'references' | 'permissions' | 'workspaces'> {
  /** The ID of this Saved Object, guaranteed to be unique for all objects of the same `type` */
  id: string;
  /**  The type of this Saved Object. Each plugin can define it's own custom Saved Object types. */
  type: string;
  /** {@inheritdoc SavedObjectAttributes} */
  attributes: Partial<T>;
  /**
   * Optional namespace string to use when searching for this object. If this is defined, it will supersede the namespace ID that is in
   * {@link SavedObjectsBulkUpdateOptions}.
   *
   * Note: the default namespace's string representation is `'default'`, and its ID representation is `undefined`.
   **/
  namespace?: string;
}

/**
 *
 * @public
 */
export interface SavedObjectsBulkResponse<T = unknown> {
  saved_objects: Array<SavedObject<T>>;
}

/**
 *
 * @public
 */
export interface SavedObjectsFindResult<T = unknown> extends SavedObject<T> {
  /**
   * The OpenSearch `_score` of this result.
   */
  score: number;
}

/**
 * Return type of the Saved Objects `find()` method.
 *
 * *Note*: this type is different between the Public and Server Saved Objects
 * clients.
 *
 * @public
 */
export interface SavedObjectsFindResponse<T = unknown> {
  saved_objects: Array<SavedObjectsFindResult<T>>;
  total: number;
  per_page: number;
  page: number;
}

/**
 *
 * @public
 */
export interface SavedObjectsCheckConflictsObject {
  id: string;
  type: string;
}

/**
 *
 * @public
 */
export interface SavedObjectsCheckConflictsResponse {
  errors: Array<{
    id: string;
    type: string;
    error: SavedObjectError;
  }>;
}

/**
 *
 * @public
 */
export interface SavedObjectsUpdateOptions extends SavedObjectsBaseOptions {
  /** An opaque version number which changes on each successful write operation. Can be used for implementing optimistic concurrency control. */
  version?: string;
  /** {@inheritdoc SavedObjectReference} */
  references?: SavedObjectReference[];
  /** The OpenSearch Refresh setting for this operation */
  refresh?: MutatingOperationRefreshSetting;
  /** permission control describe by ACL object */
  permissions?: Permissions;
  workspaces?: string[];
}

/**
 *
 * @public
 */
export interface SavedObjectsAddToNamespacesOptions extends SavedObjectsBaseOptions {
  /** An opaque version number which changes on each successful write operation. Can be used for implementing optimistic concurrency control. */
  version?: string;
  /** The OpenSearch Refresh setting for this operation */
  refresh?: MutatingOperationRefreshSetting;
}

/**
 *
 * @public
 */
export interface SavedObjectsAddToNamespacesResponse {
  /** The namespaces the object exists in after this operation is complete. */
  namespaces: string[];
}

/**
 *
 * @public
 */
export interface SavedObjectsDeleteFromNamespacesOptions extends SavedObjectsBaseOptions {
  /** The OpenSearch Refresh setting for this operation */
  refresh?: MutatingOperationRefreshSetting;
}

/**
 *
 * @public
 */
export interface SavedObjectsDeleteFromNamespacesResponse {
  /** The namespaces the object exists in after this operation is complete. An empty array indicates the object was deleted. */
  namespaces: string[];
}

/**
 *
 * @public
 */
export interface SavedObjectsBulkUpdateOptions extends SavedObjectsBaseOptions {
  /** The OpenSearch Refresh setting for this operation */
  refresh?: MutatingOperationRefreshSetting;
}

/**
 *
 * @public
 */
export interface SavedObjectsDeleteOptions extends SavedObjectsBaseOptions {
  /** The OpenSearch Refresh setting for this operation */
  refresh?: MutatingOperationRefreshSetting;
  /** Force deletion of an object that exists in multiple namespaces */
  force?: boolean;
}

/**
 *
 * @public
 */
export interface SavedObjectsBulkGetObject {
  id: string;
  type: string;
  /** SavedObject fields to include in the response */
  fields?: string[];
}

/**
 *
 * @public
 */
export interface SavedObjectsBulkResponse<T = unknown> {
  saved_objects: Array<SavedObject<T>>;
}

/**
 *
 * @public
 */
export interface SavedObjectsBulkUpdateResponse<T = unknown> {
  saved_objects: Array<SavedObjectsUpdateResponse<T>>;
}

/**
 *
 * @public
 */
export interface SavedObjectsUpdateResponse<T = unknown>
  extends Omit<SavedObject<T>, 'attributes' | 'references'> {
  attributes: Partial<T>;
  references: SavedObjectReference[] | undefined;
}

/**
 *
 * @public
 */
export interface SavedObjectsDeleteByWorkspaceOptions extends SavedObjectsBaseOptions {
  /** The OpenSearch supports only boolean flag for this operation */
  refresh?: boolean;
}

/**
 *
 * @public
 */
export class SavedObjectsClient {
  public static errors = SavedObjectsErrorHelpers;
  public errors = SavedObjectsErrorHelpers;

  private _repository: ISavedObjectsRepository;

  /** @internal */
  constructor(repository: ISavedObjectsRepository) {
    this._repository = repository;
  }

  /**
   * Persists a SavedObject
   *
   * @param type
   * @param attributes
   * @param options
   */
  async create<T = unknown>(type: string, attributes: T, options?: SavedObjectsCreateOptions) {
    return await this._repository.create(type, attributes, options);
  }

  /**
   * Persists multiple documents batched together as a single request
   *
   * @param objects
   * @param options
   */
  async bulkCreate<T = unknown>(
    objects: Array<SavedObjectsBulkCreateObject<T>>,
    options?: SavedObjectsCreateOptions
  ) {
    return await this._repository.bulkCreate(objects, options);
  }

  /**
   * Check what conflicts will result when creating a given array of saved objects. This includes "unresolvable conflicts", which are
   * multi-namespace objects that exist in a different namespace; such conflicts cannot be resolved/overwritten.
   *
   * @param objects
   * @param options
   */
  async checkConflicts(
    objects: SavedObjectsCheckConflictsObject[] = [],
    options: SavedObjectsBaseOptions = {}
  ): Promise<SavedObjectsCheckConflictsResponse> {
    return await this._repository.checkConflicts(objects, options);
  }

  /**
   * Deletes a SavedObject
   *
   * @param type
   * @param id
   * @param options
   */
  async delete(type: string, id: string, options: SavedObjectsDeleteOptions = {}) {
    return await this._repository.delete(type, id, options);
  }

  /**
   * Find all SavedObjects matching the search query
   *
   * @param options
   */
  async find<T = unknown>(options: SavedObjectsFindOptions): Promise<SavedObjectsFindResponse<T>> {
    return await this._repository.find(options);
  }

  /**
   * Returns an array of objects by id
   *
   * @param objects - an array of ids, or an array of objects containing id, type and optionally fields
   * @example
   *
   * bulkGet([
   *   { id: 'one', type: 'config' },
   *   { id: 'foo', type: 'index-pattern' }
   * ])
   */
  async bulkGet<T = unknown>(
    objects: SavedObjectsBulkGetObject[] = [],
    options: SavedObjectsBaseOptions = {}
  ): Promise<SavedObjectsBulkResponse<T>> {
    return await this._repository.bulkGet(objects, options);
  }

  /**
   * Retrieves a single object
   *
   * @param type - The type of SavedObject to retrieve
   * @param id - The ID of the SavedObject to retrieve
   * @param options
   */
  async get<T = unknown>(
    type: string,
    id: string,
    options: SavedObjectsBaseOptions = {}
  ): Promise<SavedObject<T>> {
    return await this._repository.get(type, id, options);
  }

  /**
   * Updates an SavedObject
   *
   * @param type
   * @param id
   * @param options
   */
  async update<T = unknown>(
    type: string,
    id: string,
    attributes: Partial<T>,
    options: SavedObjectsUpdateOptions = {}
  ): Promise<SavedObjectsUpdateResponse<T>> {
    return await this._repository.update(type, id, attributes, options);
  }

  /**
   * Adds namespaces to a SavedObject
   *
   * @param type
   * @param id
   * @param namespaces
   * @param options
   */
  async addToNamespaces(
    type: string,
    id: string,
    namespaces: string[],
    options: SavedObjectsAddToNamespacesOptions = {}
  ): Promise<SavedObjectsAddToNamespacesResponse> {
    return await this._repository.addToNamespaces(type, id, namespaces, options);
  }

  /**
   * Removes namespaces from a SavedObject
   *
   * @param type
   * @param id
   * @param namespaces
   * @param options
   */
  async deleteFromNamespaces(
    type: string,
    id: string,
    namespaces: string[],
    options: SavedObjectsDeleteFromNamespacesOptions = {}
  ): Promise<SavedObjectsDeleteFromNamespacesResponse> {
    return await this._repository.deleteFromNamespaces(type, id, namespaces, options);
  }

  /**
   * delete saved objects by workspace id
   * @param workspace
   * @param options
   */
  deleteByWorkspace = async (
    workspace: string,
    options: SavedObjectsDeleteByWorkspaceOptions = {}
  ): Promise<any> => {
    return await this._repository.deleteByWorkspace(workspace, options);
  };

  /**
   * Remove a saved object from workspaces
   * @param type
   * @param id
   * @param workspaces
   */
  deleteFromWorkspaces = async <T = unknown>(type: string, id: string, workspaces: string[]) => {
    if (!workspaces || workspaces.length === 0) {
      throw new TypeError(`Workspaces is required.`);
    }
    const object = await this.get<T>(type, id);
    const existingWorkspaces = object.workspaces ?? [];
    const newWorkspaces = existingWorkspaces.filter((item) => {
      return workspaces.indexOf(item) === -1;
    });
    if (newWorkspaces.length > 0) {
      return await this.update<T>(type, id, object.attributes, {
        workspaces: newWorkspaces,
        version: object.version,
      });
    } else {
      // If there is no workspaces assigned, will create object with overwrite to delete workspace property.
      return await this.create(
        type,
        {
          ...object.attributes,
        },
        {
          id,
          permissions: object.permissions,
          overwrite: true,
          version: object.version,
        }
      );
    }
  };

  /**
   * Add a saved object to workspaces
   * @param type
   * @param id
   * @param workspaces
   */
  addToWorkspaces = async <T = unknown>(
    type: string,
    id: string,
    workspaces: string[]
  ): Promise<any> => {
    if (!workspaces || workspaces.length === 0) {
      throw new TypeError(`Workspaces is required.`);
    }
    const object = await this.get<T>(type, id);
    const existingWorkspaces = object.workspaces ?? [];
    const mergedWorkspaces = existingWorkspaces.concat(workspaces);
    const nonDuplicatedWorkspaces = Array.from(new Set(mergedWorkspaces));

    return await this.update<T>(type, id, object.attributes, {
      workspaces: nonDuplicatedWorkspaces,
      version: object.version,
    });
  };

  /**
   * Bulk Updates multiple SavedObject at once
   *
   * @param objects
   */
  async bulkUpdate<T = unknown>(
    objects: Array<SavedObjectsBulkUpdateObject<T>>,
    options?: SavedObjectsBulkUpdateOptions
  ): Promise<SavedObjectsBulkUpdateResponse<T>> {
    return await this._repository.bulkUpdate(objects, options);
  }
}
