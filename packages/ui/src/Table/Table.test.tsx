import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Table } from './Table';
import type { Column } from './types';

interface TestData {
  id: string;
  name: string;
  email: string;
}

const columns: Column<TestData>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email' },
];

const data: TestData[] = [
  { id: '1', name: 'John', email: 'john@example.com' },
  { id: '2', name: 'Jane', email: 'jane@example.com' },
];

describe('Table', () => {
  it('should render table with headers', () => {
    render(<Table columns={columns} data={data} rowKey="id" />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('should render data rows', () => {
    render(<Table columns={columns} data={data} rowKey="id" />);
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('should call onRowClick when row clicked', () => {
    const onRowClick = vi.fn();
    render(<Table columns={columns} data={data} rowKey="id" onRowClick={onRowClick} />);
    fireEvent.click(screen.getByText('John'));
    expect(onRowClick).toHaveBeenCalledWith(data[0]);
  });

  it('should show loading skeleton', () => {
    render(<Table columns={columns} data={data} rowKey="id" isLoading={true} />);
    expect(screen.queryByText('John')).not.toBeInTheDocument();
  });

  it('should show empty message when no data', () => {
    render(<Table columns={columns} data={[]} rowKey="id" emptyMessage="No results" />);
    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('should call onSort when sortable header clicked', () => {
    const onSort = vi.fn();
    render(<Table columns={columns} data={data} rowKey="id" onSort={onSort} />);
    fireEvent.click(screen.getByText('Name'));
    expect(onSort).toHaveBeenCalledWith('name', 'asc');
  });

  it('should use render function for custom cell content', () => {
    const customColumns: Column<TestData>[] = [
      {
        key: 'name',
        label: 'Name',
        render: (value) => <strong>{value}</strong>,
      },
    ];
    render(<Table columns={customColumns} data={data} rowKey="id" />);
    expect(screen.getByText('John')).toBeInTheDocument();
  });
});
