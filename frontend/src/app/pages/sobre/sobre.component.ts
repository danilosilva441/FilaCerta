import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sobre-contato',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col p-4 md:p-8 font-sans">
      <button
        routerLink="/"
        class="text-gray-500 hover:text-orange-500 flex items-center gap-2 mb-4 text-sm font-medium"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          ></path>
        </svg>
        Voltar ao Cardápio
      </button>
      <!-- Card Principal -->
      <div
        class="max-w-md w-full mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1"
      >
        <!-- Header/Capa -->
        <div class="bg-orange-500 p-6 text-center">
          <div
            class="w-20 h-20 bg-white rounded-full mx-auto mb-3 flex items-center justify-center shadow-md"
          >
            <span class="text-2xl text-orange-500">🍔</span>
            <!-- Troque pela Logo -->
          </div>
          <h1 class="text-2xl font-bold text-white">Nome da Lanchonete</h1>
          <p class="text-orange-100 text-sm mt-1">Sua fome não precisa de fila.</p>
        </div>

        <div class="p-6 space-y-6">
          <!-- Horários -->
          <section>
            <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Horário de Funcionamento
            </h2>
            <ul class="text-gray-700 space-y-2 text-sm">
              <li class="flex justify-between border-b border-gray-50 pb-1">
                <span>Terça a Quinta</span> <span class="font-medium">18:00 - 23:30</span>
              </li>
              <li class="flex justify-between border-b border-gray-50 pb-1">
                <span>Sexta a Domingo</span> <span class="font-medium">18:00 - 00:30</span>
              </li>
              <li class="flex justify-between text-gray-400 pb-1">
                <span>Segunda-feira</span> <span>Fechado</span>
              </li>
            </ul>
          </section>

          <!-- Endereço -->
          <section>
            <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Endereço
            </h2>
            <div class="flex items-start gap-3 text-gray-700 text-sm">
              <svg
                class="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                ></path>
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
              </svg>
              <p>Rua Exemplo, 123 - Bairro Centro<br />Recife - PE</p>
            </div>
          </section>

          <!-- Botões de Contato -->
          <section class="space-y-3 pt-2">
            <a
              href="https://wa.me/5581999999999"
              target="_blank"
              class="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-xl transition-colors"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.245 3.487 5.236 3.487 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.312 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.898-4.45 9.898-9.898 0-2.64-1.027-5.118-2.893-6.985-1.866-1.867-4.345-2.895-6.985-2.896-5.449 0-9.899 4.45-9.899 9.899 0 2.14.622 4.148 1.8 5.856l-1.168 4.269 4.364-1.157zm10.158-5.385c-.538-.27-3.176-1.567-3.668-1.747-.492-.18-.85-.27-1.21.27-.358.54-1.385 1.747-1.698 2.107-.313.36-.627.405-1.165.135-2.148-.962-3.882-2.315-5.35-4.402-.23-.33-.024-.51.245-.778.232-.23.538-.63.807-.945.269-.315.359-.54.539-.9.18-.36.09-.675-.045-.945-.135-.27-1.21-2.925-1.658-4.005-.434-1.047-.875-1.047-1.21-1.047-.313 0-.672-.045-1.031-.045-.359 0-.942.135-1.435.675-.493.54-1.883 1.845-1.883 4.5 0 2.655 1.928 5.22 2.197 5.58.269.36 3.807 5.805 9.22 8.145 1.288.555 2.293.885 3.076 1.125 1.293.405 2.471.345 3.4.21.928-.135 3.176-1.29 3.624-2.55.448-1.26.448-2.34.313-2.55-.135-.21-.493-.315-1.031-.585z"
                />
              </svg>
              Falar no WhatsApp
            </a>

            <a
              href="https://instagram.com/"
              target="_blank"
              class="w-full flex items-center justify-center gap-2 bg-pink-50 hover:bg-pink-100 text-pink-600 font-medium py-3 px-4 rounded-xl transition-colors border border-pink-100"
            >
              Ver cardápio no Instagram
            </a>
          </section>
        </div>
      </div>

      <!-- Footer / Assinatura -->
      <div class="mt-8 text-center text-xs text-gray-400 pb-4">
        <p>
          Desenvolvido por
          <a href="#" class="font-semibold text-gray-500 hover:text-orange-500 transition-colors"
            >DS SysTech</a
          >
        </p>
      </div>
    </div>
  `,
})
export class SobreContatoComponent {}
