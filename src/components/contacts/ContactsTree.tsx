"use client";
import React, { useState } from "react";
import { Users, Building2 } from "lucide-react";

interface Person {
  id: string;
  name: string;
  position: string;
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
              <img
                src={item.leader.avatar}
                alt={item.leader.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getInitials(item.leader.name)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {item.leader.name}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {item.leader.position}
              {item.leader.isPartner && (
                <span className="ml-1 text-blue-600 dark:text-blue-400">• Партнер</span>
              )}
            </p>
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
                <img
                  src={employee.avatar}
                  alt={employee.name}
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

// Пример данных
const contactsData: ContactItem = {
  id: "company",
  name: "Компания",
  type: "company",
  leader: {
    id: "leader-1",
    name: "Елена Андреева",
    position: "CEO, Partner",
    isPartner: true,
  },
  employeesCount: 7,
  children: [
    {
      id: "rnd",
      name: "R&D",
      type: "department",
      leader: {
        id: "leader-2",
        name: "Михаил Веллер",
        position: "Технический директор, партн...",
        isPartner: true,
      },
      employeesCount: 6,
      subDepartmentsCount: 2,
      children: [
        {
          id: "production",
          name: "Производство",
          type: "subdepartment",
          leader: {
            id: "leader-3",
            name: "Виктория Апрельская",
            position: "Руководитель проектов, п...",
            isPartner: true,
          },
          employeesCount: 1,
          subDepartmentsCount: 8,
        },
        {
          id: "support",
          name: "Техподдержка",
          type: "subdepartment",
          leader: {
            id: "leader-4",
            name: "Виктория Апрельская",
            position: "Руководитель направлени...",
          },
        },
      ],
    },
    {
      id: "marketing",
      name: "Маркетинг РУ",
      type: "department",
      leader: {
        id: "leader-5",
        name: "Дмитрий Понамарев",
        position: "Директор",
      },
      children: [
        {
          id: "marketing-dept",
          name: "Маркетинг",
          type: "subdepartment",
          leader: {
            id: "leader-6",
            name: "Полина Аркадова",
            position: "Заместитель директора п...",
          },
          subDepartmentsCount: 9,
        },
      ],
    },
    {
      id: "finance",
      name: "Финансы",
      type: "department",
      leader: {
        id: "leader-7",
        name: "Зинаида Милова",
        position: "Финдиректор, партнер",
        isPartner: true,
      },
      employeesCount: 1,
      children: [
        {
          id: "accounting",
          name: "Бухгалтерия",
          type: "subdepartment",
          leader: {
            id: "leader-8",
            name: "Галина Щедрая",
            position: "Руководитель",
          },
          subDepartmentsCount: 6,
        },
        {
          id: "finance-west",
          name: "Фин. отдел Запад",
          type: "subdepartment",
          leader: {
            id: "leader-9",
            name: "Николай Ростов",
            position: "Финдиректор зап.направл...",
          },
          employeesCount: 2,
        },
      ],
    },
    {
      id: "sales",
      name: "Партнеры и продажи",
      type: "department",
      leader: {
        id: "leader-10",
        name: "Екатерина Милютина",
        position: "Переговорщик, партнер",
        isPartner: true,
      },
      children: [
        {
          id: "sales-dept",
          name: "Отдел продаж",
          type: "subdepartment",
          leader: {
            id: "leader-11",
            name: "Эльвира Бренда",
            position: "Руководитель отдела прод...",
          },
          subDepartmentsCount: 2,
        },
        {
          id: "partners",
          name: "Партнерский отдел",
          type: "subdepartment",
          leader: {
            id: "leader-12",
            name: "Маргарита Юсупова",
            position: "руководитель партнёрско...",
          },
          employeesCount: 14,
        },
      ],
    },
    {
      id: "rental",
      name: "Арендные решения",
      type: "department",
      leader: {
        id: "leader-13",
        name: "Никита Морозов",
        position: "сапер-иллюзионист",
      },
      employeesCount: 6,
      children: [
        {
          id: "methodology",
          name: "Методология внедрен...",
          type: "subdepartment",
          leader: {
            id: "leader-14",
            name: "Эльвира Штокина",
            position: "Head of Data Science",
          },
        },
      ],
    },
    {
      id: "hr",
      name: "HR",
      type: "department",
      leader: {
        id: "leader-15",
        name: "Максим Филатов",
        position: "HR Director",
      },
      employeesCount: 3,
      children: [
        {
          id: "adaptation",
          name: "Адаптация перо",
          type: "subdepartment",
          leader: {
            id: "leader-16",
            name: "Валерий Ник",
            position: "HR People Partr",
          },
          employeesCount: 2,
        },
        {
          id: "admin",
          name: "Администриров",
          type: "subdepartment",
          leader: {
            id: "leader-17",
            name: "Мария Ким",
            position: "HR-Admin",
          },
          employeesCount: 2,
        },
      ],
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
