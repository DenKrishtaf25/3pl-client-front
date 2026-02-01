"use client";
import React from 'react';

export default function DocumentationContent() {
  return (
    <div className="documentation-content">
      <h1 id="overview">Документация</h1>
      
      <div className="toc">
        <h3>Содержание</h3>
        <ul>
          <li><a href="#overview-section">Обзор системы</a></li>
          <li><a href="#architecture">Архитектура</a></li>
          <li><a href="#api">API Документация</a>
            <ul>
              <li><a href="#api-auth">Аутентификация</a></li>
              <li><a href="#api-users">Пользователи</a></li>
              <li><a href="#api-clients">Клиенты</a></li>
              <li><a href="#api-stock">Товарный запас</a></li>
              <li><a href="#api-registry">Транспорт (Реестры)</a></li>
              <li><a href="#api-orders">Заказы</a></li>
              <li><a href="#api-analytics">Аналитика</a></li>
              <li><a href="#api-finance">Финансы</a></li>
              <li><a href="#api-complaints">Рекламации</a></li>
            </ul>
          </li>
          <li><a href="#data-import">Импорт данных</a></li>
          <li><a href="#security">Безопасность</a></li>
        </ul>
      </div>

      <h2 id="overview-section">Обзор системы</h2>
      <p>
        ПЭК 3PL Account - это система управления логистическими операциями для клиентов компании ПЭК. 
        Система предоставляет функционал для управления товарными запасами, заказами, транспортом, 
        финансами и рекламациями.
      </p>

      <h3>Основные возможности</h3>
      <ul>
        <li>Управление товарными запасами (складской учет)</li>
        <li>Отслеживание заказов и их статусов</li>
        <li>Управление транспортными реестрами</li>
        <li>Аналитика и отчетность</li>
        <li>Финансовый учет</li>
        <li>Обработка рекламаций</li>
        <li>Автоматический импорт данных из CSV файлов</li>
        <li>Многоклиентская архитектура с разделением доступа</li>
      </ul>

      <h3>Технологический стек</h3>
      <h4>Backend</h4>
      <ul>
        <li><strong>Framework:</strong> NestJS 10</li>
        <li><strong>Язык:</strong> TypeScript</li>
        <li><strong>База данных:</strong> PostgreSQL</li>
        <li><strong>ORM:</strong> Prisma 6</li>
        <li><strong>Аутентификация:</strong> JWT (Access + Refresh tokens)</li>
      </ul>

      <h4>Frontend</h4>
      <ul>
        <li><strong>Framework:</strong> Next.js 15</li>
        <li><strong>UI Library:</strong> React 19</li>
        <li><strong>Стили:</strong> Tailwind CSS 4</li>
        <li><strong>Язык:</strong> TypeScript</li>
      </ul>

      <h2 id="architecture">Архитектура</h2>
      
      <h3>Backend архитектура</h3>
      <p>
        Backend построен на основе модульной архитектуры NestJS. Каждый модуль отвечает за определенную 
        бизнес-область и содержит контроллер, сервис и DTO для валидации данных.
      </p>

      <h4>Модули системы</h4>
      <ul>
        <li><strong>AuthModule</strong> - аутентификация и авторизация</li>
        <li><strong>UserModule</strong> - управление пользователями</li>
        <li><strong>ClientModule</strong> - управление клиентами</li>
        <li><strong>StockModule</strong> - товарные запасы</li>
        <li><strong>RegistryModule</strong> - транспортные реестры</li>
        <li><strong>OrderModule</strong> - заказы</li>
        <li><strong>AnalyticsModule</strong> - аналитика</li>
        <li><strong>AnalyticOrderModule</strong> - аналитика по заказам</li>
        <li><strong>FinanceModule</strong> - финансы</li>
        <li><strong>ComplaintsModule</strong> - рекламации</li>
        <li><strong>SchedulerModule</strong> - автоматический импорт данных</li>
      </ul>

      <h4>Роли пользователей</h4>
      <ul>
        <li><strong>USER</strong> - обычный пользователь, имеет доступ только к данным своих клиентов</li>
        <li><strong>ADMIN</strong> - администратор, имеет полный доступ ко всем данным и функциям управления</li>
      </ul>

      <h3>Frontend архитектура</h3>
      <p>
        Frontend построен на Next.js 15 с использованием App Router. Приложение разделено на:
      </p>
      <ul>
        <li><strong>Пользовательская часть</strong> - доступна всем авторизованным пользователям</li>
        <li><strong>Административная панель</strong> - доступна только администраторам</li>
      </ul>

      <h2 id="api">API Документация</h2>
      
      <div className="info-box">
        <p><strong>Базовый URL:</strong> <code>/api</code></p>
        <p><strong>Формат данных:</strong> JSON</p>
        <p><strong>Аутентификация:</strong> JWT токен в заголовке <code>Authorization: Bearer &lt;token&gt;</code></p>
      </div>

      <h3 id="api-auth">Аутентификация</h3>
      
      <div className="api-endpoint">
        <div>
          <span className="method post">POST</span>
          <span className="endpoint-path">/api/auth/login</span>
        </div>
        <p><strong>Описание:</strong> Вход в систему</p>
        <p><strong>Защита:</strong> Rate limiting (3 запроса в минуту)</p>
        <h4>Request Body:</h4>
        <pre><code>{JSON.stringify({
          email: "string",
          password: "string"
        }, null, 2)}</code></pre>
        <h4>Response:</h4>
        <pre><code>{JSON.stringify({
          accessToken: "string",
          user: {
            id: "string",
            email: "string",
            name: "string",
            role: "USER" | "ADMIN"
          }
        }, null, 2)}</code></pre>
        <p className="warning-box">
          <strong>Важно:</strong> Refresh token устанавливается в HTTP-only cookie автоматически.
        </p>
      </div>

      <div className="api-endpoint">
        <div>
          <span className="method post">POST</span>
          <span className="endpoint-path">/api/auth/login/access-token</span>
        </div>
        <p><strong>Описание:</strong> Обновление access token</p>
        <p><strong>Требования:</strong> Refresh token в cookie</p>
        <h4>Response:</h4>
        <pre><code>{JSON.stringify({
          accessToken: "string",
          user: {
            id: "string",
            email: "string",
            name: "string",
            role: "USER" | "ADMIN"
          }
        }, null, 2)}</code></pre>
      </div>

      <div className="api-endpoint">
        <div>
          <span className="method post">POST</span>
          <span className="endpoint-path">/api/auth/logout</span>
        </div>
        <p><strong>Описание:</strong> Выход из системы</p>
        <p><strong>Требования:</strong> Авторизация</p>
      </div>

      <h3 id="api-users">Пользователи</h3>

      <div className="api-endpoint">
        <div>
          <span className="method get">GET</span>
          <span className="endpoint-path">/api/user/profile</span>
        </div>
        <p><strong>Описание:</strong> Получение профиля текущего пользователя</p>
        <p><strong>Требования:</strong> Авторизация</p>
      </div>

      <div className="api-endpoint">
        <div>
          <span className="method put">PUT</span>
          <span className="endpoint-path">/api/user/profile</span>
        </div>
        <p><strong>Описание:</strong> Обновление профиля текущего пользователя</p>
        <p><strong>Требования:</strong> Авторизация</p>
      </div>

      <h4>Административные эндпоинты</h4>
      <p className="info-box">
        Все административные эндпоинты требуют роль <strong>ADMIN</strong>
      </p>

      <div className="api-endpoint">
        <div>
          <span className="method get">GET</span>
          <span className="endpoint-path">/api/admin/users</span>
        </div>
        <p><strong>Описание:</strong> Получение списка всех пользователей</p>
      </div>

      <div className="api-endpoint">
        <div>
          <span className="method post">POST</span>
          <span className="endpoint-path">/api/admin/users</span>
        </div>
        <p><strong>Описание:</strong> Создание нового пользователя</p>
      </div>

      <div className="api-endpoint">
        <div>
          <span className="method put">PUT</span>
          <span className="endpoint-path">/api/admin/users/:id</span>
        </div>
        <p><strong>Описание:</strong> Обновление пользователя</p>
      </div>

      <div className="api-endpoint">
        <div>
          <span className="method delete">DELETE</span>
          <span className="endpoint-path">/api/admin/users/:id</span>
        </div>
        <p><strong>Описание:</strong> Удаление пользователя</p>
      </div>

      <h3 id="api-clients">Клиенты</h3>

      <div className="api-endpoint">
        <div>
          <span className="method get">GET</span>
          <span className="endpoint-path">/api/admin/clients</span>
        </div>
        <p><strong>Описание:</strong> Получение списка всех клиентов</p>
      </div>

      <div className="api-endpoint">
        <div>
          <span className="method post">POST</span>
          <span className="endpoint-path">/api/admin/clients</span>
        </div>
        <p><strong>Описание:</strong> Создание нового клиента</p>
        <h4>Request Body:</h4>
        <pre><code>{JSON.stringify({
          TIN: "string (ИНН)",
          companyName: "string"
        }, null, 2)}</code></pre>
      </div>

      <div className="api-endpoint">
        <div>
          <span className="method put">PUT</span>
          <span className="endpoint-path">/api/admin/clients/:id</span>
        </div>
        <p><strong>Описание:</strong> Обновление клиента</p>
      </div>

      <div className="api-endpoint">
        <div>
          <span className="method delete">DELETE</span>
          <span className="endpoint-path">/api/admin/clients/:id</span>
        </div>
        <p><strong>Описание:</strong> Удаление клиента</p>
      </div>

      <h3 id="api-stock">Товарный запас</h3>

      <div className="api-endpoint">
        <div>
          <span className="method get">GET</span>
          <span className="endpoint-path">/api/stocks</span>
        </div>
        <p><strong>Описание:</strong> Получение списка товарных запасов</p>
        <p><strong>Требования:</strong> Авторизация</p>
        <h4>Query параметры:</h4>
        <table>
          <thead>
            <tr>
              <th>Параметр</th>
              <th>Тип</th>
              <th>Описание</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>page</code></td>
              <td>number</td>
              <td>Номер страницы (по умолчанию: 1)</td>
            </tr>
            <tr>
              <td><code>limit</code></td>
              <td>number</td>
              <td>Количество записей на странице (по умолчанию: 20)</td>
            </tr>
            <tr>
              <td><code>clientTIN</code></td>
              <td>string</td>
              <td>Фильтр по ИНН клиента</td>
            </tr>
            <tr>
              <td><code>warehouse</code></td>
              <td>string</td>
              <td>Фильтр по складу</td>
            </tr>
            <tr>
              <td><code>search</code></td>
              <td>string</td>
              <td>Поиск по номенклатуре, артикулу</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="api-endpoint">
        <div>
          <span className="method get">GET</span>
          <span className="endpoint-path">/api/stocks/meta/last-import</span>
        </div>
        <p><strong>Описание:</strong> Информация о последнем импорте товарных запасов</p>
      </div>

      <div className="api-endpoint">
        <div>
          <span className="method get">GET</span>
          <span className="endpoint-path">/api/stocks/:id</span>
        </div>
        <p><strong>Описание:</strong> Получение конкретной записи товарного запаса</p>
      </div>

      <h4>Административные эндпоинты</h4>
      <div className="api-endpoint">
        <div>
          <span className="method post">POST</span>
          <span className="endpoint-path">/api/admin/stocks</span>
        </div>
        <p><strong>Описание:</strong> Создание записи товарного запаса</p>
      </div>

      <div className="api-endpoint">
        <div>
          <span className="method put">PUT</span>
          <span className="endpoint-path">/api/admin/stocks/:id</span>
        </div>
        <p><strong>Описание:</strong> Обновление записи товарного запаса</p>
      </div>

      <div className="api-endpoint">
        <div>
          <span className="method delete">DELETE</span>
          <span className="endpoint-path">/api/admin/stocks/:id</span>
        </div>
        <p><strong>Описание:</strong> Удаление записи товарного запаса</p>
      </div>

      <h3 id="api-registry">Транспорт (Реестры)</h3>

      <div className="api-endpoint">
        <div>
          <span className="method get">GET</span>
          <span className="endpoint-path">/api/registries</span>
        </div>
        <p><strong>Описание:</strong> Получение списка транспортных реестров</p>
        <p><strong>Требования:</strong> Авторизация</p>
        <h4>Query параметры:</h4>
        <table>
          <thead>
            <tr>
              <th>Параметр</th>
              <th>Тип</th>
              <th>Описание</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>page</code></td>
              <td>number</td>
              <td>Номер страницы</td>
            </tr>
            <tr>
              <td><code>limit</code></td>
              <td>number</td>
              <td>Количество записей на странице</td>
            </tr>
            <tr>
              <td><code>clientTIN</code></td>
              <td>string</td>
              <td>Фильтр по ИНН клиента</td>
            </tr>
            <tr>
              <td><code>status</code></td>
              <td>string</td>
              <td>Фильтр по статусу</td>
            </tr>
            <tr>
              <td><code>dateFrom</code></td>
              <td>string (ISO date)</td>
              <td>Фильтр по дате от</td>
            </tr>
            <tr>
              <td><code>dateTo</code></td>
              <td>string (ISO date)</td>
              <td>Фильтр по дате до</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="api-endpoint">
        <div>
          <span className="method get">GET</span>
          <span className="endpoint-path">/api/registries/meta/last-import</span>
        </div>
        <p><strong>Описание:</strong> Информация о последнем импорте реестров</p>
      </div>

      <h3 id="api-orders">Заказы</h3>

      <div className="api-endpoint">
        <div>
          <span className="method get">GET</span>
          <span className="endpoint-path">/api/orders</span>
        </div>
        <p><strong>Описание:</strong> Получение списка заказов</p>
        <p><strong>Требования:</strong> Авторизация</p>
        <h4>Query параметры:</h4>
        <table>
          <thead>
            <tr>
              <th>Параметр</th>
              <th>Тип</th>
              <th>Описание</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>page</code></td>
              <td>number</td>
              <td>Номер страницы</td>
            </tr>
            <tr>
              <td><code>limit</code></td>
              <td>number</td>
              <td>Количество записей на странице</td>
            </tr>
            <tr>
              <td><code>clientTIN</code></td>
              <td>string</td>
              <td>Фильтр по ИНН клиента</td>
            </tr>
            <tr>
              <td><code>status</code></td>
              <td>string</td>
              <td>Фильтр по статусу</td>
            </tr>
            <tr>
              <td><code>exportDateFrom</code></td>
              <td>string (ISO date)</td>
              <td>Фильтр по дате экспорта от</td>
            </tr>
            <tr>
              <td><code>exportDateTo</code></td>
              <td>string (ISO date)</td>
              <td>Фильтр по дате экспорта до</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="api-endpoint">
        <div>
          <span className="method get">GET</span>
          <span className="endpoint-path">/api/orders/meta/last-import</span>
        </div>
        <p><strong>Описание:</strong> Информация о последнем импорте заказов</p>
      </div>

      <h3 id="api-analytics">Аналитика</h3>

      <div className="api-endpoint">
        <div>
          <span className="method get">GET</span>
          <span className="endpoint-path">/api/analytics/chart</span>
        </div>
        <p><strong>Описание:</strong> Получение данных для графика аналитики</p>
        <p><strong>Требования:</strong> Авторизация</p>
        <h4>Query параметры:</h4>
        <table>
          <thead>
            <tr>
              <th>Параметр</th>
              <th>Тип</th>
              <th>Описание</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>clientTIN</code></td>
              <td>string</td>
              <td>ИНН клиента или несколько через запятую (например: "7702785539,1234567890")</td>
            </tr>
          </tbody>
        </table>
        <h4>Response:</h4>
        <pre><code>{JSON.stringify({
          data: [
            {
              date: "2024-05-05",
              quantityByRequest: 0,
              quantityByPlan: 0,
              quantityByFact: 1,
              quantityByDeparture: 0
            }
          ],
          defaultClientTIN: "7702785539",
          availableClients: [
            {
              TIN: "7702785539",
              companyName: "ООО \"ДЕНТСПЛАЙ СИРОНА\""
            }
          ],
          lastImportAt: "2024-01-15T10:30:00.000Z"
        }, null, 2)}</code></pre>
        <p className="info-box">
          <strong>Примечание:</strong> Если <code>clientTIN</code> не указан, используется первый доступный клиент пользователя. 
          При указании нескольких ИНН данные автоматически суммируются по датам.
        </p>
      </div>

      <div className="api-endpoint">
        <div>
          <span className="method get">GET</span>
          <span className="endpoint-path">/api/analytics/meta/last-import</span>
        </div>
        <p><strong>Описание:</strong> Информация о последнем импорте аналитики</p>
      </div>

      <div className="api-endpoint">
        <div>
          <span className="method get">GET</span>
          <span className="endpoint-path">/api/analytic-orders/chart</span>
        </div>
        <p><strong>Описание:</strong> Получение данных для графика аналитики по заказам</p>
      </div>

      <h3 id="api-finance">Финансы</h3>

      <div className="api-endpoint">
        <div>
          <span className="method get">GET</span>
          <span className="endpoint-path">/api/finance</span>
        </div>
        <p><strong>Описание:</strong> Получение списка финансовых записей</p>
        <p><strong>Требования:</strong> Авторизация</p>
        <h4>Query параметры:</h4>
        <table>
          <thead>
            <tr>
              <th>Параметр</th>
              <th>Тип</th>
              <th>Описание</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>page</code></td>
              <td>number</td>
              <td>Номер страницы</td>
            </tr>
            <tr>
              <td><code>limit</code></td>
              <td>number</td>
              <td>Количество записей на странице</td>
            </tr>
            <tr>
              <td><code>clientTIN</code></td>
              <td>string</td>
              <td>Фильтр по ИНН клиента</td>
            </tr>
            <tr>
              <td><code>status</code></td>
              <td>string</td>
              <td>Фильтр по статусу</td>
            </tr>
            <tr>
              <td><code>dateFrom</code></td>
              <td>string (ISO date)</td>
              <td>Фильтр по дате от</td>
            </tr>
            <tr>
              <td><code>dateTo</code></td>
              <td>string (ISO date)</td>
              <td>Фильтр по дате до</td>
            </tr>
            <tr>
              <td><code>amountFrom</code></td>
              <td>number</td>
              <td>Фильтр по сумме от</td>
            </tr>
            <tr>
              <td><code>amountTo</code></td>
              <td>number</td>
              <td>Фильтр по сумме до</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="api-endpoint">
        <div>
          <span className="method get">GET</span>
          <span className="endpoint-path">/api/finance/stats/status</span>
        </div>
        <p><strong>Описание:</strong> Статистика по статусам финансовых записей</p>
      </div>

      <h3 id="api-complaints">Рекламации</h3>

      <div className="api-endpoint">
        <div>
          <span className="method get">GET</span>
          <span className="endpoint-path">/api/complaints</span>
        </div>
        <p><strong>Описание:</strong> Получение списка рекламаций</p>
        <p><strong>Требования:</strong> Авторизация</p>
        <h4>Query параметры:</h4>
        <table>
          <thead>
            <tr>
              <th>Параметр</th>
              <th>Тип</th>
              <th>Описание</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>page</code></td>
              <td>number</td>
              <td>Номер страницы</td>
            </tr>
            <tr>
              <td><code>limit</code></td>
              <td>number</td>
              <td>Количество записей на странице</td>
            </tr>
            <tr>
              <td><code>clientTIN</code></td>
              <td>string</td>
              <td>Фильтр по ИНН клиента</td>
            </tr>
            <tr>
              <td><code>status</code></td>
              <td>string</td>
              <td>Фильтр по статусу</td>
            </tr>
            <tr>
              <td><code>confirmation</code></td>
              <td>boolean</td>
              <td>Фильтр по подтверждению</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="api-endpoint">
        <div>
          <span className="method get">GET</span>
          <span className="endpoint-path">/api/complaints/stats/status</span>
        </div>
        <p><strong>Описание:</strong> Статистика по статусам рекламаций</p>
      </div>

      <div className="api-endpoint">
        <div>
          <span className="method get">GET</span>
          <span className="endpoint-path">/api/complaints/stats/type</span>
        </div>
        <p><strong>Описание:</strong> Статистика по типам рекламаций</p>
      </div>

      <div className="api-endpoint">
        <div>
          <span className="method post">POST</span>
          <span className="endpoint-path">/api/complaints/send-email</span>
        </div>
        <p><strong>Описание:</strong> Отправка email с рекламацией</p>
        <p><strong>Требования:</strong> Авторизация</p>
        <p className="info-box">
          Поддерживает как JSON, так и multipart/form-data (для загрузки файлов).
          Максимальный размер файла: 10 МБ.
        </p>
      </div>

      <h2 id="data-import">Импорт данных</h2>
      
      <p>
        Система поддерживает автоматический импорт данных из CSV файлов. Импорт выполняется 
        автоматически по расписанию через SchedulerModule.
      </p>

      <h3>Типы импортируемых данных</h3>
      <ul>
        <li><strong>Клиенты</strong> - из файла <code>clients.csv</code></li>
        <li><strong>Товарные запасы</strong> - из файла <code>stock.csv</code></li>
        <li><strong>Реестры</strong> - из файла <code>registry.csv</code></li>
        <li><strong>Заказы</strong> - из файлов <code>orders/*.csv</code></li>
        <li><strong>Аналитика</strong> - из файла <code>analytics.csv</code></li>
        <li><strong>Аналитика по заказам</strong> - из файла <code>analytic_orders.csv</code></li>
        <li><strong>Финансы</strong> - из файла <code>finance.csv</code></li>
        <li><strong>Рекламации</strong> - из файла <code>complaints.csv</code></li>
      </ul>

      <h3>Ручной импорт</h3>
      <p>
        Для ручного импорта данных можно использовать npm скрипты:
      </p>
      <pre><code>{`npm run import:clients
npm run import:stock
npm run import:registry
npm run import:orders
npm run import:analytics
npm run import:finance
npm run import:complaints`}</code></pre>

      <h2 id="security">Безопасность</h2>

      <h3>Аутентификация</h3>
      <ul>
        <li>JWT токены (Access + Refresh)</li>
        <li>Refresh token хранится в HTTP-only cookie</li>
        <li>Access token передается в заголовке Authorization</li>
        <li>Автоматическое обновление access token при истечении</li>
      </ul>

      <h3>Авторизация</h3>
      <ul>
        <li>Role-based access control (RBAC)</li>
        <li>Пользователи видят только данные своих клиентов</li>
        <li>Администраторы имеют полный доступ</li>
      </ul>

      <h3>Защита от атак</h3>
      <ul>
        <li><strong>Rate Limiting:</strong> 100 запросов в минуту (глобально), 3 запроса в минуту для логина</li>
        <li><strong>CORS:</strong> Настроен для работы только с разрешенными доменами</li>
        <li><strong>Валидация данных:</strong> Все входные данные валидируются через class-validator</li>
        <li><strong>Хеширование паролей:</strong> Используется argon2</li>
      </ul>

      <h3>Переменные окружения</h3>
      <p>
        Для работы системы необходимо настроить следующие переменные окружения:
      </p>
      <table>
        <thead>
          <tr>
            <th>Переменная</th>
            <th>Описание</th>
            <th>Пример</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>DATABASE_URL</code></td>
            <td>URL подключения к PostgreSQL</td>
            <td><code>postgresql://user:password@localhost:5432/dbname</code></td>
          </tr>
          <tr>
            <td><code>JWT_SECRET</code></td>
            <td>Секретный ключ для JWT</td>
            <td><code>your-secret-key</code></td>
          </tr>
          <tr>
            <td><code>FRONTEND_URL</code></td>
            <td>URL фронтенд приложения (для CORS)</td>
            <td><code>http://localhost:3000</code></td>
          </tr>
          <tr>
            <td><code>PORT</code></td>
            <td>Порт для backend сервера</td>
            <td><code>4200</code></td>
          </tr>
        </tbody>
      </table>

      <div className="success-box">
        <p><strong>Версия документации:</strong> 1.0.0</p>
        <p><strong>Дата обновления:</strong> {new Date().toLocaleDateString('ru-RU')}</p>
      </div>
    </div>
  );
}

