const salesCompetencies = [
  "Согласование Договора оказания услуг и Приложений к нему",
  "Согласование оказания новых доп. услуг в соответствии с запросом Клиента",
  "Обсуждение условий работы по Договору (изменение существующих процессов, тарифов, дополнительные сервисы, финансовые условия, новые проекты и т.д.)",
  "Коммерческие условия",
];

const supportLeadCompetencies = [
  "Организация и контроль выполнения контрактных условий",
  "Принятие решений по вопросам, не предусмотренным Договором и тарифами на оказание услуг",
  "Общение и переговоры с Хранителем по вопросам пересмотра договорных условий, тарифов на обслуживание, нормативов, процедур, документооборота, отчетности, оказания дополнительного сервиса и услуг",
];

const qualityLeadCompetencies = [
  "Претензии и рекламации",
  "Отправка уведомлений по официальным претензиям и компенсациям",
  "Подписание бухгалтерских документов (МХ-1, МХ-3, МХ-20, Акт выполненных работ, УПД)",
  "Общий контроль и поддержание качества услуг",
];

function CompetenciesList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default function ContactsDirectoryTable() {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
      <table className="min-w-[1100px] w-full border-collapse text-sm text-gray-800 dark:text-gray-200">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800/60">
            <th
              rowSpan={2}
              className="border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-3 py-2 text-left align-middle font-semibold"
            >
              ФИО
            </th>
            <th
              rowSpan={2}
              className="border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-3 py-2 text-left align-middle font-semibold"
            >
              Должность
            </th>
            <th
              colSpan={2}
              className="border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-3 py-2 text-center align-middle font-semibold"
            >
              Контактные данные
            </th>
            <th
              rowSpan={2}
              className="border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-3 py-2 text-left align-middle font-semibold"
            >
              Компетенции
            </th>
          </tr>
          <tr className="bg-gray-100 dark:bg-gray-800/60">
            <th className="border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-3 py-2 text-left font-semibold">
              телефон
            </th>
            <th className="border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-3 py-2 text-left font-semibold">
              e-mail
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td
              colSpan={2}
              className="border border-gray-300 dark:border-gray-700 px-3 py-3 text-center font-medium"
            >
              Отдел продаж
            </td>
            <td className="border border-gray-300 dark:border-gray-700 px-3 py-3 align-top" />
            <td className="border border-gray-300 dark:border-gray-700 px-3 py-3 align-top">
              3pl-sales@pecom.ru
            </td>
            <td className="border border-gray-300 dark:border-gray-700 px-3 py-3 align-top">
              <CompetenciesList items={salesCompetencies} />
            </td>
          </tr>

          <tr>
            <td className="border border-gray-300 dark:border-gray-700 px-3 py-3 align-top">
              Королева Виктория Владимировна
            </td>
            <td className="border border-gray-300 dark:border-gray-700 px-3 py-3 align-top">
              Начальник отдела сопровождения клиентов
            </td>
            <td className="border border-gray-300 dark:border-gray-700 px-3 py-3 align-top whitespace-pre-line">
              {"тел.: +7 (495) 660 1111 доб. 1403\nмоб.: +7 (903) 78 666 16"}
            </td>
            <td className="border border-gray-300 dark:border-gray-700 px-3 py-3 align-top">
              koroleva.vv@pecom.ru
            </td>
            <td className="border border-gray-300 dark:border-gray-700 px-3 py-3 align-top">
              <CompetenciesList items={supportLeadCompetencies} />
            </td>
          </tr>

          <tr className="bg-gray-50 dark:bg-gray-800/30">
            <td
              colSpan={5}
              className="border border-gray-300 dark:border-gray-700 px-3 py-3 text-center font-medium"
            >
              Менеджер по сопровождению клиентов
            </td>
          </tr>

          <tr>
            <td className="border border-gray-300 dark:border-gray-700 px-3 py-3 align-top">
              Панков Сергей Михайлович
            </td>
            <td className="border border-gray-300 dark:border-gray-700 px-3 py-3 align-top">
              Руководитель по качеству
            </td>
            <td className="border border-gray-300 dark:border-gray-700 px-3 py-3 align-top">
              +7 (906) 089-03-93
            </td>
            <td className="border border-gray-300 dark:border-gray-700 px-3 py-3 align-top whitespace-pre-line">
              {"pankov.sm@pecom.ru\nclaims-3pl@pecom.ru\nvip@pecom.ru\ncargo2@admin24.ru"}
            </td>
            <td className="border border-gray-300 dark:border-gray-700 px-3 py-3 align-top">
              <CompetenciesList items={qualityLeadCompetencies} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
