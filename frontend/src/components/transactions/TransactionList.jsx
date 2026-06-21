import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useTable, usePagination, useSortBy } from 'react-table';
import { format } from 'date-fns';
import { transactionApi } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const TransactionList = () => {
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    status: '',
    page: 1,
    limit: 20
  });

  const { data, isLoading } = useQuery(
    ['transactions', filters],
    () => transactionApi.get(filters),
    { keepPreviousData: true }
  );

  const columns = React.useMemo(() => [
    {
      Header: 'Date',
      accessor: 'transaction_date',
      Cell: ({ value }) => format(new Date(value), 'dd/MM/yyyy')
    },
    {
      Header: 'Model',
      accessor: 'model_name'
    },
    {
      Header: 'Variant',
      accessor: 'variant_name'
    },
    {
      Header: 'Purchase Price',
      accessor: 'purchase_price',
      Cell: ({ value }) => `Rp ${value.toLocaleString()}`
    },
    {
      Header: 'Selling Price',
      accessor: 'selling_price',
      Cell: ({ value }) => value ? `Rp ${value.toLocaleString()}` : '-'
    },
    {
      Header: 'Profit',
      accessor: 'profit',
      Cell: ({ value }) => (
        <span className={value >= 0 ? 'text-green-600' : 'text-red-600'}>
          Rp {value?.toLocaleString() || 0}
        </span>
      )
    },
    {
      Header: 'Status',
      accessor: 'status',
      Cell: ({ value }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'completed' ? 'bg-green-100 text-green-800' :
          value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    }
  ], []);

  const tableData = data?.data || [];
  const tableColumns = columns;

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    state: { pageIndex }
  } = useTable(
    {
      columns: tableColumns,
      data: tableData,
      initialState: { pageIndex: 0, pageSize: filters.limit }
    },
    useSortBy,
    usePagination
  );

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="date"
          value={filters.start_date}
          onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        />
        <input
          type="date"
          value={filters.end_date}
          onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button
          onClick={() => setFilters({ ...filters, page: 1 })}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          Search
        </button>
      </div>

      <div className="overflow-x-auto">
        <table {...getTableProps()} className="w-full">
          <thead className="bg-gray-50">
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                  >
                    {column.render('Header')}
                    <span>
                      {column.isSorted ? (column.isSortedDesc ? ' ↓' : ' ↑') : ''}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} className="divide-y divide-gray-200">
            {page.map(row => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} className="hover:bg-gray-50 transition">
                  {row.cells.map(cell => (
                    <td {...cell.getCellProps()} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-700">
          Page <span className="font-medium">{pageIndex + 1}</span> of{' '}
          <span className="font-medium">{pageCount}</span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => gotoPage(0)}
            disabled={!canPreviousPage}
            className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
          >
            First
          </button>
          <button
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
            className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
          >
            Previous
          </button>
          <button
            onClick={() => nextPage()}
            disabled={!canNextPage}
            className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
          >
            Next
          </button>
          <button
            onClick={() => gotoPage(pageCount - 1)}
            disabled={!canNextPage}
            className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionList;