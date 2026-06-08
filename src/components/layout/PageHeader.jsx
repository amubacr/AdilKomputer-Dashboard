import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Plus } from 'lucide-react';

export default function PageHeader({ title, onAdd, addLabel = 'Produk Baru' }) {
  const now = new Date();
  const timeStr = format(now, 'HH.mm', { locale: id });
  const dateStr = format(now, 'EEE, dd MMM yyyy', { locale: id });

  return (
    <div className="bg-red-800 text-white px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0">
      <h1 className="text-sm font-semibold truncate">{title}</h1>
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <span className="hidden sm:block text-xs text-red-200">live {timeStr} | {dateStr}</span>
        {onAdd && (
          <button onClick={onAdd} className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{addLabel}</span>
            <span className="sm:hidden">+</span>
          </button>
        )}
      </div>
    </div>
  );
}
