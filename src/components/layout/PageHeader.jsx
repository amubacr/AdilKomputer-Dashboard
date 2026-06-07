import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Plus } from 'lucide-react';

export default function PageHeader({ title, onAdd, addLabel = 'Produk Baru' }) {
  const now = new Date();
  const timeStr = format(now, 'HH.mm', { locale: id });
  const dateStr = format(now, 'EEE, dd MMM yyyy', { locale: id });

  return (
    <div className="bg-red-800 text-white px-6 py-3 flex items-center justify-between flex-shrink-0">
      <h1 className="text-base font-semibold">{title}</h1>
      <div className="flex items-center gap-4">
        <span className="text-xs text-red-200">live {timeStr} | {dateStr}</span>
        {onAdd && (
          <button onClick={onAdd} className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
            <Plus className="w-3.5 h-3.5" />
            {addLabel}
          </button>
        )}
      </div>
    </div>
  );
}
