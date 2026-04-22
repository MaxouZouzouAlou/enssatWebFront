export default function DataTable({ columns, emptyLabel = 'Aucune donnée à afficher.', getRowKey, rows }) {
	return (
		<div className="overflow-x-auto">
			<table className="w-full border-collapse">
				<thead>
					<tr>
						{columns.map((column) => (
							<th
								key={column.key}
								className="border-b border-neutral-300 px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-600"
							>
								{column.header}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((row, rowIndex) => (
						<tr key={getRowKey ? getRowKey(row, rowIndex) : rowIndex}>
							{columns.map((column) => (
								<td key={column.key} className="border-b border-neutral-200 px-2 py-3 text-sm">
									{column.render ? column.render(row) : row[column.key]}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
			{rows.length === 0 ? (
				<p className="py-8 text-center text-sm text-neutral-600">{emptyLabel}</p>
			) : null}
		</div>
	);
}
