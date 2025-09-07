export function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 border-t">
      <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} Blibli Kloningan. Dibuat dengan ❤️.</p>
      </div>
    </footer>
  );
}