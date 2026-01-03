import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Trash2, X, Image as ImageIcon, CheckSquare, Square, Upload } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import TextArea from '../components/ui/TextArea';
import clsx from 'clsx';

const TripDetails = ({ trip, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('notes'); // 'notes', 'images', 'todos'
  const [newTodo, setNewTodo] = useState('');
  const fileInputRef = useRef(null);

  const handleUpdateNotes = (notes) => {
    onUpdate({ ...trip, notes });
  };

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    const todos = trip.todos || [];
    onUpdate({ 
      ...trip, 
      todos: [...todos, { id: Date.now(), text: newTodo, completed: false }] 
    });
    setNewTodo('');
  };

  const toggleTodo = (todoId) => {
    const todos = trip.todos || [];
    onUpdate({
      ...trip,
      todos: todos.map(t => t.id === todoId ? { ...t, completed: !t.completed } : t)
    });
  };

  const deleteTodo = (todoId) => {
    const todos = trip.todos || [];
    onUpdate({
      ...trip,
      todos: todos.filter(t => t.id !== todoId)
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const images = trip.images || [];
        onUpdate({
          ...trip,
          images: [...images, reader.result]
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteImage = (index) => {
    const images = trip.images || [];
    onUpdate({
      ...trip,
      images: images.filter((_, i) => i !== index)
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-love-50 p-6 flex justify-between items-center border-b border-love-100">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-full text-love-500 shadow-sm">
              <MapPin size={24} />
            </div>
            <h2 className="text-2xl font-serif text-love-800">{trip.destination}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {[
            { id: 'notes', label: 'Notes', icon: '📝' },
            { id: 'images', label: 'Gallery', icon: '📸' },
            { id: 'todos', label: 'To-Do List', icon: '✅' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex-1 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2",
                activeTab === tab.id ? "text-love-600 border-b-2 border-love-500 bg-love-50/30" : "text-gray-500 hover:text-love-400 hover:bg-gray-50"
              )}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-warm-cream/30">
          
          {activeTab === 'notes' && (
            <div className="space-y-4">
               <TextArea 
                  value={trip.notes}
                  onChange={(e) => handleUpdateNotes(e.target.value)}
                  className="min-h-[300px] text-lg leading-relaxed bg-white shadow-sm"
                  placeholder="Write your travel dreams, ideas, and notes here..."
               />
            </div>
          )}

          {activeTab === 'images' && (
            <div className="space-y-6">
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 {(trip.images || []).map((img, idx) => (
                   <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden shadow-sm border-2 border-white">
                     <img src={img} alt="Trip memory" className="w-full h-full object-cover" />
                     <button 
                       onClick={() => deleteImage(idx)}
                       className="absolute top-2 right-2 bg-white/90 text-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50"
                     >
                       <Trash2 size={16} />
                     </button>
                   </div>
                 ))}
                 
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="aspect-square rounded-xl border-2 border-dashed border-love-200 flex flex-col items-center justify-center text-love-400 hover:bg-love-50 hover:border-love-300 transition-all gap-2"
                 >
                   <Upload size={24} />
                   <span className="text-sm font-medium">Add Photo</span>
                 </button>
               </div>
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 className="hidden" 
                 accept="image/*"
                 onChange={handleImageUpload}
               />
               <p className="text-xs text-center text-gray-400">
                 Note: Images are saved in your browser. Large images might fill up storage quickly.
               </p>
            </div>
          )}

          {activeTab === 'todos' && (
            <div className="space-y-6">
              <form onSubmit={handleAddTodo} className="flex gap-2">
                <Input 
                  value={newTodo}
                  onChange={e => setNewTodo(e.target.value)}
                  placeholder="Add a task (e.g., Book flights, Buy sunscreen)"
                  className="bg-white shadow-sm"
                />
                <Button type="submit">Add</Button>
              </form>

              <div className="space-y-2">
                {(trip.todos || []).length === 0 && (
                  <p className="text-center text-gray-400 py-8 italic">No tasks yet. Start planning!</p>
                )}
                {(trip.todos || []).map(todo => (
                  <motion.div 
                    key={todo.id}
                    layout
                    className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-warm-beige group"
                  >
                    <button 
                      onClick={() => toggleTodo(todo.id)}
                      className={clsx(
                        "transition-colors",
                        todo.completed ? "text-love-500" : "text-gray-300 hover:text-love-400"
                      )}
                    >
                      {todo.completed ? <CheckSquare size={24} /> : <Square size={24} />}
                    </button>
                    <span className={clsx(
                      "flex-1 transition-all",
                      todo.completed ? "text-gray-400 line-through" : "text-gray-700"
                    )}>
                      {todo.text}
                    </span>
                    <button 
                      onClick={() => deleteTodo(todo.id)}
                      className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity px-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const Wishlist = () => {
  const [trips, setTrips] = useState(() => {
    const saved = localStorage.getItem('love_space_trips');
    return saved ? JSON.parse(saved) : [];
  });
  const [isAdding, setIsAdding] = useState(false);
  const [newTrip, setNewTrip] = useState({ destination: '', notes: '' });
  const [selectedTripId, setSelectedTripId] = useState(null);

  useEffect(() => {
    localStorage.setItem('love_space_trips', JSON.stringify(trips));
  }, [trips]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTrip.destination.trim()) return;
    
    // Initialize with empty images and todos
    setTrips([...trips, { ...newTrip, id: Date.now(), images: [], todos: [] }]);
    setNewTrip({ destination: '', notes: '' });
    setIsAdding(false);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation(); // Prevent opening modal
    if (window.confirm('Are you sure you want to delete this trip?')) {
      setTrips(trips.filter(t => t.id !== id));
      if (selectedTripId === id) setSelectedTripId(null);
    }
  };

  const handleUpdateTrip = (updatedTrip) => {
    setTrips(trips.map(t => t.id === updatedTrip.id ? updatedTrip : t));
  };

  const selectedTrip = trips.find(t => t.id === selectedTripId);

  return (
    <div className="space-y-6">
      <header className="text-center space-y-2">
        <h2 className="text-3xl font-serif text-love-800">Travel Wishlists</h2>
        <p className="text-gray-600">Dream destinations to explore together</p>
      </header>
      
      <div className="flex justify-center">
        {!isAdding ? (
          <Button onClick={() => setIsAdding(true)} className="animate-pulse">
            <Plus size={18} /> Add New Adventure
          </Button>
        ) : (
          <motion.form 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-warm-beige w-full max-w-md space-y-4"
            onSubmit={handleAdd}
          >
            <h3 className="font-serif text-lg text-love-700">Where to next?</h3>
            <Input 
              placeholder="Destination (e.g., Paris, Tokyo)" 
              value={newTrip.destination}
              onChange={(e) => setNewTrip({...newTrip, destination: e.target.value})}
              autoFocus
            />
            <TextArea 
              placeholder="Why do we want to go there?"
              value={newTrip.notes}
              onChange={(e) => setNewTrip({...newTrip, notes: e.target.value})}
            />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button type="submit">Add to Wishlist</Button>
            </div>
          </motion.form>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
          {trips.map((trip) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              layout
              onClick={() => setSelectedTripId(trip.id)}
              className="bg-white p-6 rounded-2xl shadow-sm border border-warm-beige relative group cursor-pointer hover:shadow-md hover:border-love-300 transition-all"
            >
              <button 
                onClick={(e) => handleDelete(trip.id, e)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <Trash2 size={18} />
              </button>
              <div className="flex items-start gap-4">
                <div className="bg-love-50 p-3 rounded-full text-love-500 flex-shrink-0">
                  <MapPin size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-serif text-love-800 truncate">{trip.destination}</h3>
                  <p className="text-gray-600 mt-1 line-clamp-2 text-sm">{trip.notes || "No notes yet..."}</p>
                  
                  {/* Mini indicators */}
                  <div className="flex gap-3 mt-3 text-xs text-gray-400">
                    {(trip.images && trip.images.length > 0) && (
                      <span className="flex items-center gap-1"><ImageIcon size={12} /> {trip.images.length} Photos</span>
                    )}
                    {(trip.todos && trip.todos.length > 0) && (
                       <span className="flex items-center gap-1"><CheckSquare size={12} /> {trip.todos.filter(t => t.completed).length}/{trip.todos.length} Tasks</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {trips.length === 0 && !isAdding && (
          <div className="col-span-full text-center py-10 text-gray-400">
            <p>No trips planned yet. Start dreaming!</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedTrip && (
          <TripDetails 
            trip={selectedTrip} 
            onClose={() => setSelectedTripId(null)} 
            onUpdate={handleUpdateTrip}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Wishlist;
