/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import './App.scss';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const products = productsFromServer.map(product => {
  const category = categoriesFromServer.find(c => c.id === product.categoryId);
  const user = usersFromServer.find(u => u.id === category.ownerId);

  return {
    ...product,
    category,
    user,
  };
});

export const App = () => {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null,
  });

  const filteredProducts = products
    .filter(product => !selectedUserId || product.user.id === selectedUserId)
    .filter(product => {
      return product.name.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .filter(product => {
      return (
        selectedCategoryIds.length === 0 ||
        selectedCategoryIds.includes(product.category.id)
      );
    });

  const sortedProducts = [...filteredProducts];

  if (sortConfig.key) {
    sortedProducts.sort((a, b) => {
      let valA;
      let valB;

      if (sortConfig.key === 'category') {
        valA = a.category.title;
        valB = b.category.title;
      } else if (sortConfig.key === 'user') {
        valA = a.user.name;
        valB = b.user.name;
      } else {
        valA = a[sortConfig.key];
        valB = b[sortConfig.key];
      }

      if (typeof valA === 'string') {
        return sortConfig.direction === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
    });
  }

  const handleSort = key => {
    setSortConfig(prev => {
      if (prev.key !== key) {
        return { key, direction: 'asc' };
      }

      if (prev.direction === 'asc') {
        return { key, direction: 'desc' };
      }

      return { key: null, direction: null };
    });
  };

  const getSortIcon = key => {
    if (sortConfig.key !== key) {
      return 'fa-sort';
    }

    return sortConfig.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  };

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                data-cy="FilterAllUsers"
                href="#/"
                className={!selectedUserId ? 'is-active' : ''}
                onClick={() => setSelectedUserId(null)}
              >
                All
              </a>

              {usersFromServer.map(user => (
                <a
                  key={user.id}
                  data-cy="FilterUser"
                  href="#/"
                  className={selectedUserId === user.id ? 'is-active' : ''}
                  onClick={() => setSelectedUserId(user.id)}
                >
                  {user.name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={evt => setSearchTerm(evt.target.value)}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                {searchTerm && (
                  <span className="icon is-right">
                    {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setSearchTerm('')}
                    />
                  </span>
                )}
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={`button is-success mr-6 ${selectedCategoryIds.length > 0 ? 'is-outlined' : ''}`}
                onClick={() => setSelectedCategoryIds([])}
              >
                All
              </a>

              {categoriesFromServer.map(category => {
                const isSelected = selectedCategoryIds.includes(category.id);

                return (
                  <a
                    key={category.id}
                    data-cy="Category"
                    href="#/"
                    className={`button mr-2 my-1 ${isSelected ? 'is-info' : ''}`}
                    onClick={() => {
                      setSelectedCategoryIds(prev => {
                        return isSelected
                          ? prev.filter(id => id !== category.id)
                          : [...prev, category.id];
                      });
                    }}
                  >
                    {category.title}
                  </a>
                );
              })}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={() => {
                  setSelectedUserId(null);
                  setSearchTerm('');
                  setSelectedCategoryIds([]);
                  setSortConfig({ key: null, direction: null });
                }}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {sortedProducts.length === 0 ? (
            <p data-cy="NoMatchingMessage">
              No products matching selected criteria
            </p>
          ) : (
            <table
              data-cy="ProductTable"
              className="table is-striped is-narrow is-fullwidth"
            >
              <thead>
                <tr>
                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      ID
                      <a href="#/" onClick={() => handleSort('id')}>
                        <span className="icon">
                          <i
                            data-cy="SortIcon"
                            className={`fas ${getSortIcon('id')}`}
                          />
                        </span>
                      </a>
                    </span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      Product
                      <a href="#/" onClick={() => handleSort('name')}>
                        <span className="icon">
                          <i
                            data-cy="SortIcon"
                            className={`fas ${getSortIcon('name')}`}
                          />
                        </span>
                      </a>
                    </span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      Category
                      <a href="#/" onClick={() => handleSort('category')}>
                        <span className="icon">
                          <i
                            data-cy="SortIcon"
                            className={`fas ${getSortIcon('category')}`}
                          />
                        </span>
                      </a>
                    </span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      User
                      <a href="#/" onClick={() => handleSort('user')}>
                        <span className="icon">
                          <i
                            data-cy="SortIcon"
                            className={`fas ${getSortIcon('user')}`}
                          />
                        </span>
                      </a>
                    </span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {sortedProducts.map(product => (
                  <tr key={product.id} data-cy="Product">
                    <td className="has-text-weight-bold" data-cy="ProductId">
                      {product.id}
                    </td>

                    <td data-cy="ProductName">{product.name}</td>
                    <td data-cy="ProductCategory">
                      {product.category.icon} - {product.category.title}
                    </td>

                    <td
                      data-cy="ProductUser"
                      className={
                        product.user.sex === 'm'
                          ? 'has-text-link'
                          : 'has-text-danger'
                      }
                    >
                      {product.user.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
