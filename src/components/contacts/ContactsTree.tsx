"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Users, Building2 } from "lucide-react";

interface Person {
  id: string;
  name: string;
  position: string;
  email?: string;
  avatar?: string;
  isPartner?: boolean;
}

interface ContactItem {
  id: string;
  name: string;
  type: "company" | "department" | "subdepartment";
  leader?: Person;
  employeesCount?: number;
  employees?: Person[];
  subDepartmentsCount?: number;
  children?: ContactItem[];
}

const getCardColor = (type: string, level: number) => {
  if (type === "company") {
    return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
  }
  if (level === 1) {
    return "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800";
  }
  return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
};

const getInitials = (name: string) => {
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

interface CardComponentProps {
  item: ContactItem;
  level: number;
}

const CardComponent: React.FC<CardComponentProps> = ({ item, level }) => {
  const cardColor = getCardColor(item.type, level);

  return (
    <div
      className={`${cardColor} border-2 rounded-lg p-3 w-[240px] flex-shrink-0 shadow-sm hover:shadow-md transition-shadow`}
    >
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base mb-2 line-clamp-2">
        {item.name}
      </h3>
      {item.leader && (
        <div className="flex items-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium text-xs flex-shrink-0">
            {item.leader.avatar ? (
              <Image
                src={item.leader.avatar}
                alt={item.leader.name}
                width={36}
                height={36}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getInitials(item.leader.name)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words">
              {item.leader.name}
            </p>
            {item.leader.email && (
              <p className="text-xs text-gray-600 dark:text-gray-400 break-all">
                {item.leader.email}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 flex-wrap">
        {item.employeesCount !== undefined && (
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{item.employeesCount} сотрудников</span>
          </div>
        )}
        {item.subDepartmentsCount !== undefined && item.subDepartmentsCount > 0 && (
          <div className="flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>Еще {item.subDepartmentsCount} подразделений</span>
          </div>
        )}
      </div>

      {item.employees && item.employees.length > 0 && (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          {item.employees.slice(0, 6).map((employee) => (
            <div
              key={employee.id}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-xs font-medium"
              title={employee.name}
            >
              {employee.avatar ? (
                <Image
                  src={employee.avatar}
                  alt={employee.name}
                  width={32}
                  height={32}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getInitials(employee.name)
              )}
            </div>
          ))}
          {item.employees.length > 6 && (
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300 text-xs font-medium">
              +{item.employees.length - 6}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface TreeNodeProps {
  item: ContactItem;
  level: number;
  expandedItems: Set<string>;
  onToggle: (id: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ item, level, expandedItems, onToggle }) => {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedItems.has(item.id);

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <CardComponent item={item} level={level} />
        {hasChildren && (
          <button
            onClick={() => onToggle(item.id)}
            className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 z-10 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg
              className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        )}
      </div>

      {hasChildren && isExpanded && (
        <>
          {/* Вертикальная линия от карточки */}
          <div className="w-0.5 h-6 bg-gray-300 dark:bg-gray-600" />
          
          {/* Контейнер для дочерних элементов */}
          <div className="relative w-full">
            {/* Дочерние карточки с горизонтальной прокруткой */}
            <div className="flex gap-3 pt-6 overflow-x-auto pb-4 px-2 -mx-2 custom-scrollbar relative">
              {item.children!.map((child, index) => (
                <div key={child.id} className="relative flex-shrink-0">
                  {/* Вертикальная линия к карточке */}
                  <div className="absolute -top-6 left-1/2 w-0.5 h-6 bg-gray-300 dark:bg-gray-600 transform -translate-x-1/2" />
                  
                  {/* Горизонтальная линия от центральной линии */}
                  {item.children!.length === 1 ? (
                    // Если только одна карточка, линия не нужна
                    null
                  ) : index === 0 ? (
                    // Первая карточка - линия только вправо
                    <div className="absolute -top-6 left-1/2 w-1/2 h-0.5 bg-gray-300 dark:bg-gray-600" />
                  ) : index === item.children!.length - 1 ? (
                    // Последняя карточка - линия только влево
                    <div className="absolute -top-6 right-1/2 w-1/2 h-0.5 bg-gray-300 dark:bg-gray-600" />
                  ) : (
                    // Средние карточки - линии в обе стороны
                    <>
                      <div className="absolute -top-6 left-1/2 w-1/2 h-0.5 bg-gray-300 dark:bg-gray-600" />
                      <div className="absolute -top-6 right-1/2 w-1/2 h-0.5 bg-gray-300 dark:bg-gray-600" />
                    </>
                  )}
                  
                  <TreeNode
                    item={child}
                    level={level + 1}
                    expandedItems={expandedItems}
                    onToggle={onToggle}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Данные контактов ПЭК
const contactsData: ContactItem = {
  id: "company",
  name: "ООО \"ПЭК: Складская логистика\"",
  type: "company",
  leader: {
    id: "masalov-iv",
    name: "Масалов Иван Викторович",
    position: "Директор, ООО \"ПЭК: Складская логистика\"",
    email: "masalov.iv@pecom.ru",
  },
  employeesCount: 20,
  children: [
    {
      id: "operational-director",
      name: "Операционный директор",
      type: "department",
      leader: {
        id: "bardakov-ea",
        name: "Бардаков Евгений Алексеевич",
        position: "Операционный директор",
        email: "bardakov.ea@pecom.ru",
      },
      subDepartmentsCount: 9,
      children: [
        {
          id: "branch-chekhov",
          name: "Филиал Чехов",
          type: "subdepartment",
          leader: {
            id: "gurichev-vv",
            name: "Гуричев Вячеслав Вячеславович",
            position: "Директор филиала, Чехов",
            email: "gurichev.vv@pecom.ru",
          },
        },
        {
          id: "branch-krasnodar",
          name: "Филиал Краснодар",
          type: "subdepartment",
          leader: {
            id: "krisanov-uv",
            name: "Крисанов Юрий Васильевич",
            position: "Директор филиала, Краснодар",
            email: "krisanov.uv@pecom.ru",
          },
        },
        {
          id: "branch-litvinovo",
          name: "Филиал Литвиново",
          type: "subdepartment",
          leader: {
            id: "nazarov-dva",
            name: "Назаров Денис Валерьевич",
            position: "Директор филиала, Литвиново, Литвиново-ОБИ",
            email: "nazarov.dva@pecom.ru",
          },
        },
        {
          id: "branch-tomilino",
          name: "Филиал Томилино",
          type: "subdepartment",
          leader: {
            id: "sapronov-vn",
            name: "Сапронов Владимир Николаевич",
            position: "Директор филиала, Томилино",
            email: "sapronov.vn@pecom.ru",
          },
        },
        {
          id: "branch-sholokhovo-krasnoyarsk",
          name: "Филиалы Шолохово, Красноярск",
          type: "subdepartment",
          leader: {
            id: "kananin-ds",
            name: "Кананин Дмитрий Сергеевич",
            position: "Заместитель операционного директора/Директор филиала, Шолохово, Красноярск",
            email: "kananin.ds@pecom.ru",
          },
        },
        {
          id: "branch-samara-kazan",
          name: "Филиалы Самара, Казань",
          type: "subdepartment",
          leader: {
            id: "belyaev-ig",
            name: "Беляев Игорь Геннадьевич",
            position: "Заместитель операционного директора/Директор филиала, Самара, Казань",
            email: "belyaev.ig@pecom.ru",
          },
        },
        {
          id: "branch-multiple",
          name: "Множественные филиалы",
          type: "subdepartment",
          leader: {
            id: "chabiev-gu",
            name: "Чабиев Георгий Ушангович",
            position: "Сменный директор филиала/Директор филиала, Алматы, Иркутск, Магадан, Новосибирск, Пермь, Пятигорск, Санкт-Петербург, Ставрополь, Уссурийск, Челябинск, Бутово",
            email: "chabiev.gu@pecom.ru",
          },
        },
        {
          id: "branch-chekhov-2",
          name: "Филиал Чехов-2",
          type: "subdepartment",
          leader: {
            id: "viskov-po",
            name: "Висков Платон Олегович",
            position: "Сменный директор филиала, Чехов-2",
            email: "viskov.po@pecom.ru",
          },
        },
        {
          id: "branch-nizhny-novgorod",
          name: "Филиал Нижний Новгород",
          type: "subdepartment",
          leader: {
            id: "frolov-da",
            name: "Фролов Дмитрий Александрович",
            position: "ИО директора филиала/Начальник склада, Нижний Новгород",
            email: "frolov.da@pecom.ru",
          },
        },
      ],
    },
    {
      id: "service-director",
      name: "Директор службы",
      type: "department",
      leader: {
        id: "belykh-vm",
        name: "Белых Вадим Михайлович",
        position: "Директор службы",
        email: "belykh.vm@pecom.ru",
      },
      subDepartmentsCount: 2,
      children: [
        {
          id: "customer-support",
          name: "Отдел сопровождения клиентов",
          type: "subdepartment",
          leader: {
            id: "koroleva-vv",
            name: "Королева Виктория Владимировна",
            position: "Руководитель отдела, Отдел сопровождения клиентов",
            email: "koroleva.vv@pecom.ru",
          },
        },
        {
          id: "development",
          name: "Отдел развития",
          type: "subdepartment",
          leader: {
            id: "kamenskaya-yv",
            name: "Каменская Юлия Владимировна",
            position: "Руководитель отдела, Отдел развития",
            email: "kamenskaya.yv@pecom.ru",
          },
        },
      ],
    },
    {
      id: "technology-direction",
      name: "Направление технологий",
      type: "department",
      leader: {
        id: "bukh-bi",
        name: "Бух Борис Игоревич",
        position: "Руководитель направления, Направление технологий",
        email: "bukh.bi@pecom.ru",
      },
      subDepartmentsCount: 2,
      children: [
        {
          id: "tech-development",
          name: "Отдел разработки технологий",
          type: "subdepartment",
          leader: {
            id: "stefanenkov-aa",
            name: "Стефаненков Алексей Андреевич",
            position: "Начальник отдела, Отдел разработки технологий",
            email: "stefanenkov.aa@pecom.ru",
          },
        },
        {
          id: "wms-support",
          name: "Группа поддержки WMS",
          type: "subdepartment",
          leader: {
            id: "ermakova-tv",
            name: "Ермакова Таисия Валерьевна",
            position: "Руководитель группы, Группа поддержки WMS",
            email: "ermakova.tv@pecom.ru",
          },
        },
      ],
    },
    {
      id: "analytics",
      name: "Отдел аналитики и моделирования",
      type: "department",
      leader: {
        id: "lankin-ay",
        name: "Ланкин Андрей Юрьевич",
        position: "Руководитель отдела, Отдел аналитики и моделирования",
        email: "lankin.ay@pecom.ru",
      },
    },
    {
      id: "quality-control",
      name: "Отдел контроля качества",
      type: "department",
      leader: {
        id: "pankov-sm",
        name: "Панков Сергей Михайлович",
        position: "Руководитель отдела, Отдел контроля качества",
        email: "pankov.sm@pecom.ru",
      },
    },
    {
      id: "projects",
      name: "Руководитель проектов",
      type: "department",
      leader: {
        id: "skrypnikov-mo",
        name: "Скрыпников Максим Олегович",
        position: "Руководитель проектов",
        email: "skrypnikov.mo@pecom.ru",
      },
    },
  ],
};

const ContactsTree: React.FC = () => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(["company"]));

  const handleToggle = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className="w-full overflow-x-auto overflow-y-auto bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 md:p-8 custom-scrollbar">
      <div className="flex justify-center min-w-max">
        <TreeNode
          item={contactsData}
          level={0}
          expandedItems={expandedItems}
          onToggle={handleToggle}
        />
      </div>
    </div>
  );
};

export default ContactsTree;
