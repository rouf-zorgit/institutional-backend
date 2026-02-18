'use client';

import { useRef } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    ColumnDef,
    flexRender,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualizedTableProps<T> {
    data: T[];
    columns: ColumnDef<T>[];
    estimateSize?: number;
    overscan?: number;
}

export function VirtualizedTable<T>({
    data,
    columns,
    estimateSize = 60,
    overscan = 10,
}: VirtualizedTableProps<T>) {
    const tableContainerRef = useRef<HTMLDivElement>(null);

    // TanStack Table
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    const { rows } = table.getRowModel();

    // TanStack Virtual
    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => tableContainerRef.current,
        estimateSize: () => estimateSize,
        overscan,
    });

    const virtualRows = rowVirtualizer.getVirtualItems();
    const totalSize = rowVirtualizer.getTotalSize();

    const paddingTop = virtualRows.length > 0 ? virtualRows[0]?.start || 0 : 0;
    const paddingBottom =
        virtualRows.length > 0
            ? totalSize - (virtualRows[virtualRows.length - 1]?.end || 0)
            : 0;

    return (
        <div className="border rounded-lg overflow-hidden bg-white shadow">
            {/* Sticky Header */}
            <div className="bg-gray-50 border-b sticky top-0 z-10">
                <table className="w-full">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        style={{ width: header.getSize() }}
                                    >
                                        {header.isPlaceholder ? null : (
                                            <div
                                                className={
                                                    header.column.getCanSort()
                                                        ? 'cursor-pointer select-none flex items-center gap-2 hover:text-gray-700'
                                                        : ''
                                                }
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                                {{
                                                    asc: ' 🔼',
                                                    desc: ' 🔽',
                                                }[header.column.getIsSorted() as string] ?? null}
                                            </div>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                </table>
            </div>

            {/* Virtualized Body */}
            <div
                ref={tableContainerRef}
                className="overflow-auto"
                style={{ height: '600px' }}
            >
                <table className="w-full">
                    <tbody>
                        {paddingTop > 0 && (
                            <tr>
                                <td style={{ height: `${paddingTop}px` }} />
                            </tr>
                        )}
                        {virtualRows.map((virtualRow) => {
                            const row = rows[virtualRow.index];
                            return (
                                <tr
                                    key={row.id}
                                    className="border-b hover:bg-gray-50 transition-colors"
                                    data-index={virtualRow.index}
                                    ref={(node) => rowVirtualizer.measureElement(node)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td
                                            key={cell.id}
                                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                            style={{ width: cell.column.getSize() }}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                        {paddingBottom > 0 && (
                            <tr>
                                <td style={{ height: `${paddingBottom}px` }} />
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t px-6 py-3 text-sm text-gray-500">
                Showing {virtualRows.length} of {rows.length.toLocaleString()} rows
            </div>
        </div>
    );
}
