// app/components/WarehouseBlock.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Slider from "react-slick";
import { useTheme } from "@/context/ThemeContext";
import Label from "@/components/form/Label";
import { ChevronDownIcon } from "@/icons";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";

type Warehouse = {
  city: string;
  address: string;
  phone: string;
  mail: string;
  classs: string;
  area: number;
  height: number;
  typeFloor: string;
  ramp?: string;
  coords: [number, number];
  images: string[];
};

const warehouses: Warehouse[] = [
  {
    city: "Москва (Литвиново)",
    address: "141533 Московская область, Солнечногорский район, д. Шелепаново, стр. 152/2",
    phone: "+7 (800) 101-15-61",
    mail: "mpp-3PL@pecom.ru",
    classs: "A",
    area: 40000,
    height: 12,
    typeFloor: "бетонный с антипылевым покрытием",
    coords: [56.112993, 37.183091],
    images: [
      "/images/warehouse/moscow-litvinovo-1.jpg",
      "/images/warehouse/moscow-litvinovo-2.jpg",
      "/images/warehouse/moscow-litvinovo-3.jpg",
      "/images/warehouse/moscow-litvinovo-4.jpg"
    ],
  },
  {
    city: "Москва (Томилино)",
    address: "140073, Россия, Московская область, городской округ Люберцы, рабочий посёлок Томилино, микрорайон Птицефабрика, к9",
    phone: "+7 (800) 101-15-61",
    mail: "mpp-3pl@pecom.ru",
    classs: "A",
    area: 7007,
    height: 12,
    typeFloor: "бетонный с антипылевым покрытием",
    coords: [55.649896, 37.926476],
    images: [
      "/images/warehouse/moscow-tomilino-1.jpg",
      "/images/warehouse/moscow-tomilino-2.jpg",
      "/images/warehouse/moscow-tomilino-3.jpg",
      "/images/warehouse/moscow-tomilino-4.jpg",
      "/images/warehouse/moscow-tomilino-5.jpg",
      "/images/warehouse/moscow-tomilino-6.jpg"
    ],
  },
  {
    city: " Москва (Чехов)",
    address: "142326, МО, Чеховский район, село Новоселки, промзона Новоселки, владение 19, строение 5",
    phone: "+7 (800) 101-15-61",
    mail: "mpp-3pl@pecom.ru",
    classs: "A",
    area: 67000,
    height: 12,
    typeFloor: "бетонный с антипылевым покрытием",
    ramp: "есть",
    coords: [55.139162, 37.543930],
    images: [
      "/images/warehouse/moscow-chekhov-1.jpg",
      "/images/warehouse/moscow-chekhov-2.jpg",
      "/images/warehouse/moscow-chekhov-3.jpg",
      "/images/warehouse/moscow-chekhov-4.jpg",
      "/images/warehouse/moscow-chekhov-5.jpg",
      "/images/warehouse/moscow-chekhov-6.jpg"
    ],
  },
  {
    city: "г. Москва (Шолохово)",
    address: "141052, Российская Федерация, Московская область, г. Мытищи, д. Шолохово, ш. Дмитровское, строение 8А",
    phone: "+7 (800) 101-15-61",
    mail: "mpp-3pl@pecom.ru",
    classs: "A",
    area: 33000,
    height: 12,
    typeFloor: "бетонный с антипылевым покрытием",
    coords: [56.046262, 37.547188],
    images: [
      "/images/warehouse/moscow-sholokhovo-1.jpg",
      "/images/warehouse/moscow-sholokhovo-2.jpg",
      "/images/warehouse/moscow-sholokhovo-3.jpg",
      "/images/warehouse/moscow-sholokhovo-4.jpg",
      "/images/warehouse/moscow-sholokhovo-5.jpg",
      "/images/warehouse/moscow-sholokhovo-6.jpg"
    ],
  },
  {
    city: "г. Алматы",
    address: "Казахстан, Алматы, ул. Казыбаева, д. 3/2",
    phone: "+7 (800) 101-15-61",
    mail: "mpp-3PL@pecom.ru",
    classs: "C",
    area: 1900,
    height: 5,
    typeFloor: "топинг",
    coords: [43.281853, 76.919539],
    images: [
      "/images/warehouse/almaty-1.jpg",
      "/images/warehouse/almaty-2.jpg",
      "/images/warehouse/almaty-3.jpg",
      "/images/warehouse/almaty-4.jpg"
    ],
  },
  {
    city: "г. Казань",
    address: "422623, Россия, Республика Татарстан, с. Столбище, Советская ул., 271",
    phone: "+7 (800) 101-15-61",
    mail: "mpp-3pl@pecom.ru",
    classs: "A",
    area: 2897,
    height: 12,
    typeFloor: "бетонный с антипылевым покрытием",
    ramp: "есть",
    coords: [55.633794, 49.255765],
    images: [
      "/images/warehouse/kazan-1.jpg",
      "/images/warehouse/kazan-2.jpg",
      "/images/warehouse/kazan-3.jpg",
      "/images/warehouse/kazan-4.jpg",
      "/images/warehouse/kazan-5.jpg",
      "/images/warehouse/kazan-6.jpg"
    ],
  },
  {
    city: "г. Краснодар",
    address: "350901, Россия, Краснодарский Край, г. Краснодар ул. 2-я Российская 162/1",
    phone: "+7 (800) 101-15-61",
    mail: "mpp-3pl@pecom.ru",
    classs: "B",
    area: 4650,
    height: 8,
    typeFloor: "бетонный с антипылевым покрытием",
    coords: [45.083919, 39.018224],
    images: [
      "/images/warehouse/krasnodar-1.jpg",
      "/images/warehouse/krasnodar-2.jpg",
      "/images/warehouse/krasnodar-3.jpg",
      "/images/warehouse/krasnodar-4.jpg",
      "/images/warehouse/krasnodar-5.jpg",
      "/images/warehouse/krasnodar-6.jpg"
    ],
  },
  {
    city: "г. Красноярск",
    address: "660015, Красноярский край, поселок Солонцы, проспект Котельникова, 9Б",
    phone: "+7 (800) 101-15-61",
    mail: "mpp-3pl@pecom.ru",
    classs: "A",
    area: 2877,
    height: 10,
    typeFloor: "бетонный с антипылевым покрытием",
    coords: [56.055361, 92.845817],
    images: [
      "/images/warehouse/krasnoyarsk-1.jpg",
      "/images/warehouse/krasnoyarsk-2.jpg",
      "/images/warehouse/krasnoyarsk-3.jpg",
      "/images/warehouse/krasnoyarsk-4.jpg"
    ],
  },
  {
    city: "г. Нижний Новгород",
    address: "Нижегородская обл., г. Дзержинск, Нижегородское шоссе, 82",
    phone: "+7 (800) 101-15-61",
    mail: "mpp-3pl@pecom.ru",
    classs: "A",
    area: 6000,
    height: 12,
    typeFloor: "бетонный с антипылевым покрытием",
    coords: [56.290206, 43.597410],
    images: [
      "/images/warehouse/nizhny-novgorod-1.jpg",
      "/images/warehouse/nizhny-novgorod-2.jpg",
      "/images/warehouse/nizhny-novgorod-3.jpg",
      "/images/warehouse/nizhny-novgorod-4.jpg",
      "/images/warehouse/nizhny-novgorod-5.jpg",
      "/images/warehouse/nizhny-novgorod-6.jpg"
    ],
  },
  {
    city: "г. Самара",
    address: "443083, Россия, Самара, ул. 22-го Партсъезда 10а к2",
    phone: "+7 (800) 101-15-61",
    mail: "mpp-3pl@pecom.ru",
    classs: "A",
    area: 3740,
    height: 10,
    typeFloor: "бетонный с антипылевым покрытием",
    ramp: "есть",
    coords: [53.186156, 50.255349],
    images: [
      "/images/warehouse/samara-1.jpg",
      "/images/warehouse/samara-2.jpg",
      "/images/warehouse/samara-3.jpg",
      "/images/warehouse/samara-4.jpg",
      "/images/warehouse/samara-5.jpg",
      "/images/warehouse/samara-6.jpg"
    ],
  },
];

export default function WarehouseBlock() {
  const [selectedCity, setSelectedCity] = useState(warehouses[0]);
  const { theme } = useTheme();
  const [mapKey, setMapKey] = useState(0);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  // Компоненты для скрытых стрелок
  const PrevArrow = () => null;
  const NextArrow = () => null;

  // Обновляем карту при смене темы или города
  useEffect(() => {
    setMapKey((prev) => prev + 1);
  }, [theme, selectedCity]);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };


  return (
    <div className="space-y-6">
      <style dangerouslySetInnerHTML={{__html: `
        .warehouse-slider .slick-prev,
        .warehouse-slider .slick-next {
          display: none !important;
        }
        .warehouse-slider .slick-dots {
          display: flex !important;
          flex-direction: row !important;
          justify-content: center !important;
          align-items: center !important;
          gap: 0.5rem !important;
          margin-top: 1.5rem !important;
          margin-bottom: 0.5rem !important;
          list-style: none !important;
          padding: 0 !important;
        }
        .warehouse-slider .slick-dots li {
          width: auto;
          height: auto;
        }
        .warehouse-slider .slick-dots button {
          width: 0.625rem;
          height: 0.625rem;
          border-radius: 9999px;
          background-color: #d1d5db;
          border: none;
          padding: 0;
          cursor: pointer;
          text-indent: -9999px;
          overflow: hidden;
          transition: all 0.3s;
        }
        .warehouse-slider .slick-dots button:hover {
          background-color: #9ca3af;
        }
        .dark .warehouse-slider .slick-dots button {
          background-color: #4b5563;
        }
        .dark .warehouse-slider .slick-dots button:hover {
          background-color: #6b7280;
        }
        .warehouse-slider .slick-dots .slick-active button {
          background-color: #465fff;
          width: 2rem;
        }
        .dark .warehouse-slider .slick-dots .slick-active button {
          background-color: #9cb9ff;
        }
        .warehouse-slider .slick-dots button:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(70, 95, 255, 0.5);
        }
      `}} />
      {/* Верхняя часть */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Левая часть */}
        <div className="lg:w-1/2 space-y-4">
          {/* Выпадающий список */}
          <div>
            <Label>Выберите склад</Label>
            <div className="relative" ref={selectRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSelectOpen(!isSelectOpen);
                }}
                className="warehouse-select-button w-full px-4 py-3 pr-11 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-sm hover:shadow-md cursor-pointer text-left flex items-center justify-between"
              >
                <span>{selectedCity.city}</span>
                <span className={`absolute right-3 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isSelectOpen ? 'rotate-180' : ''}`}>
                  <ChevronDownIcon />
                </span>
              </button>
              <Dropdown
                isOpen={isSelectOpen}
                onClose={() => setIsSelectOpen(false)}
                className="left-0 right-0 w-full mt-1 max-h-60 overflow-y-auto"
              >
                {warehouses.map((w) => (
                  <DropdownItem
                    key={w.city}
                    onClick={() => {
                      setSelectedCity(w);
                      setIsSelectOpen(false);
                    }}
                    baseClassName="block w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
                    className={selectedCity.city === w.city ? "bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-medium" : ""}
                  >
                    {w.city}
                  </DropdownItem>
                ))}
              </Dropdown>
            </div>
          </div>

          {/* Информация о складе */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
              Информация о складе
            </h3>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[100px] mb-1 sm:mb-0">
                  Адрес:
                </span>
                <span className="text-sm text-gray-800 dark:text-gray-200 flex-1">
                  {selectedCity.address}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[100px] mb-1 sm:mb-0">
                  Телефон:
                </span>
                <a 
                  href={`tel:${selectedCity.phone.replace(/\s/g, '')}`}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                >
                  {selectedCity.phone}
                </a>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[100px] mb-1 sm:mb-0">
                  Email:
                </span>
                <a 
                  href={`mailto:${selectedCity.mail}`}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                >
                  {selectedCity.mail}
                </a>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[100px] mb-1 sm:mb-0">
                  Класс:
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  {selectedCity.classs}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[100px] mb-1 sm:mb-0">
                  Площадь:
                </span>
                <span className="text-sm text-gray-800 dark:text-gray-200">
                  {selectedCity.area.toLocaleString('ru-RU')} м²
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[100px] mb-1 sm:mb-0">
                  Высота:
                </span>
                <span className="text-sm text-gray-800 dark:text-gray-200">
                  {selectedCity.height} м
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[100px] mb-1 sm:mb-0">
                  Тип пола:
                </span>
                <span className="text-sm text-gray-800 dark:text-gray-200 flex-1">
                  {selectedCity.typeFloor}
                </span>
              </div>
              {selectedCity.ramp && (
                <div className="flex flex-col sm:flex-row sm:items-start">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[100px] mb-1 sm:mb-0">
                  Пандус:
                  </span>
                  <span className="text-sm text-gray-800 dark:text-gray-200 flex-1">
                    {selectedCity.ramp}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Правая часть — слайдер */}
        <div className="lg:w-1/2">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
              Фотографии склада
            </h3>
            <div className="slick-container warehouse-slider">
              <Slider {...sliderSettings}>
                {selectedCity.images.map((img, i) => (
                  <div key={i} className="px-2">
                    <div className="relative overflow-hidden rounded-lg group">
                      <img
                        src={img}
                        alt={`${selectedCity.city} склад ${i + 1}`}
                        className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Изображение+не+найдено';
                        }}
                      />
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          </div>
        </div>
      </div>

      {/* Яндекс.Карта */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Расположение склада
          </h3>
        </div>
        <div className="h-[500px] w-full">
          <iframe
            key={mapKey}
            src={`https://yandex.ru/map-widget/v1/?ll=${selectedCity.coords[1]}%2C${selectedCity.coords[0]}&z=12&pt=${selectedCity.coords[1]},${selectedCity.coords[0]},pm2rdl${theme === 'dark' ? '&theme=dark' : ''}`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
