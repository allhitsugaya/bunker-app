// app/scenarios/page.jsx
'use client';
import ScenariosGrid from '@/app/_components/user/ScenariosGrid';
import React from 'react';

export default function ScenariosPage() {
  const goBack = () => window.history.back();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-green-300 font-mono">
      {/* Декоративные частицы */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-cyan-400 rounded-full animate-pulse delay-700"></div>
        <div className="absolute bottom-40 left-1/4 w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-300"></div>
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-orange-400 rounded-full animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8">
        {/* Кнопка назад */}
        <button
          onClick={goBack}
          className="group flex items-center gap-2 px-4 py-3 mb-8 bg-gray-800/80 hover:bg-gray-700/80 text-green-300 border border-emerald-700/50 hover:border-emerald-500 rounded-xl transition-all duration-300 backdrop-blur-lg"
        >
          <span className="text-lg transition-transform group-hover:-translate-x-1">←</span>
          <span>Вернуться назад</span>
        </button>

        {/* Hero Section */}
        <div className="relative mb-16">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 rounded-3xl blur-xl"></div>
          <div
            className="relative text-center p-8 rounded-3xl border border-emerald-500/20 bg-gray-900/80 backdrop-blur-lg">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span
                className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                🎭 Сценарии
              </span>
            </h1>
            <p className="text-xl text-green-200/80 max-w-3xl mx-auto mb-8 leading-relaxed">
              Выберите мир, в котором будет разворачиваться ваша история выживания.
              Каждый сценарий предлагает уникальные вызовы и возможности.
            </p>

            {/* Статистика */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div
                className="text-center p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 backdrop-blur-lg">
                <div className="text-2xl font-bold text-emerald-400">5+</div>
                <div className="text-green-200/60 text-sm">сценариев</div>
              </div>
              <div
                className="text-center p-4 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 backdrop-blur-lg">
                <div className="text-2xl font-bold text-cyan-400">2-4ч</div>
                <div className="text-green-200/60 text-sm">длительность</div>
              </div>
              <div
                className="text-center p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 backdrop-blur-lg">
                <div className="text-2xl font-bold text-purple-400">4-12</div>
                <div className="text-green-200/60 text-sm">игроков</div>
              </div>
              <div
                className="text-center p-4 rounded-2xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 backdrop-blur-lg">
                <div className="text-2xl font-bold text-orange-400">3</div>
                <div className="text-green-200/60 text-sm">уровня сложности</div>
              </div>
            </div>
          </div>
        </div>

        {/* Основной контент */}
        <div className="relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-green-400 mb-4">
              Доступные миры для игры
            </h2>
            <p className="text-green-200/60 text-lg">
              Каждый сценарий предлагает уникальную атмосферу, механики и вызовы
            </p>
          </div>

          {/* Ваш компонент сценариев */}
          <ScenariosGrid />

          {/* Призыв к действию */}
          <div className="text-center mt-20">
            <div className="relative">
              <div
                className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-3xl blur-lg"></div>
              <div className="relative p-8 rounded-3xl border border-emerald-500/30 bg-gray-900/80 backdrop-blur-lg">
                <h3 className="text-2xl font-bold text-green-400 mb-4">
                  Готовы начать приключение?
                </h3>
                <p className="text-green-200/80 mb-6 text-lg">
                  Выберите сценарий, соберите команду и окунитесь в мир постапокалиптического выживания
                </p>
                <button
                  className="group bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-gray-900 font-bold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/25">
                  <span className="flex items-center gap-2">
                    <span className="text-lg transition-transform group-hover:scale-110">🚀</span>
                    <span>Начать новую игру</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}