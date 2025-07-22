type Props = {
  data: any[];
};

const formatINR = (num: number) =>
  num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export default function DCFTable({ data }: Props) {
  return (
    <div className="mt-6">
      <h3 className="font-semibold text-lg mb-2 dark:text-white">📊 Discounted Cash Flow Table</h3>
      <div className="overflow-auto border rounded">
        <table className="w-full text-xs border-collapse">
          <thead className="bg-gray-100 dark:bg-zinc-700 sticky top-0">
            <tr>
              {Object.keys(data[0]).map((col) => (
                <th key={col} className="p-2 border text-black dark:text-white">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="text-center">
                {Object.values(row).map((val, j) => (
                  <td key={j} className="p-2 border text-black dark:text-white">
                    {typeof val === 'number' ? formatINR(val) : val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
