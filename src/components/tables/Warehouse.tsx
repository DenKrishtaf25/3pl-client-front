// app/components/WarehouseBlock.tsx
"use client";

import { useState } from "react";
import Slider from "react-slick";

type Warehouse = {
  city: string;
  address: string;
  phone: string;
  mail: string;
  classs: string;
  area: number;
  height: number;
  typeFloor: string;
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
      "https://pecom.ru/upload/iblock/cd5/image4.jpg",
      "https://pecom.ru/upload/iblock/cd5/image4.jpg",
      "https://pecom.ru/upload/iblock/cd5/image4.jpg",
      "https://pecom.ru/upload/iblock/cd5/image4.jpg",
      "https://pecom.ru/upload/iblock/cd5/image4.jpg",
      "https://pecom.ru/upload/iblock/cd5/image4.jpg"
    ],
  },
  {
    city: "Москва (Томилино) ",
    address: "140073, Россия, Московская область, городской округ Люберцы, рабочий посёлок Томилино, микрорайон Птицефабрика, к9",
    phone: "+7 (800) 101-15-61",
    mail: "mpp-3pl@pecom.ru",
    classs: "A",
    area: 7007,
    height: 12,
    typeFloor: "бетонный с антипылевым покрытием",
    coords: [55.649896, 37.926476],
    images: ["/images/moscow1.jpg", "/images/moscow2.jpg", "/images/moscow3.jpg"],
  },
];

export default function WarehouseBlock() {
  const [selectedCity, setSelectedCity] = useState(warehouses[0]);
  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Верхняя часть */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Левая часть */}
        <div className="lg:w-1/2 space-y-4">
          {/* Выпадающий список */}
          <select
            className="w-full p-2 border rounded-lg"
            value={selectedCity.city}
            onChange={(e) =>
              setSelectedCity(
                warehouses.find((w) => w.city === e.target.value) || warehouses[0]
              )
            }
          >
            {warehouses.map((w) => (
              <option key={w.city} value={w.city}>
                {w.city}
              </option>
            ))}
          </select>

          {/* Информация о складе */}
          <div className="bg-gray-50 p-4 rounded-xl shadow">
            <p><span className="font-semibold">Адрес:</span> {selectedCity.address}</p>
            <p><span className="font-semibold">Телефон:</span> {selectedCity.phone}</p>
            <p><span className="font-semibold">Площадь:</span> {selectedCity.area}м²</p>
          </div>
        </div>

        {/* Правая часть — слайдер */}
        <div className="lg:w-1/2 mt-20">
          <Slider {...sliderSettings} className="">
            {selectedCity.images.map((img, i) => (
              <div key={i}>
                <img
                  src={img} alt={`${selectedCity.city} склад ${i + 1}`}
                  className="rounded-xl h-64 object-cover"
                />
              </div>
            ))}
          </Slider>
        </div>
      </div>

      {/* Яндекс.Карта */}
      <div className="mt-6 h-100 w-full">
        <iframe
          src={`https://yandex.ru/map-widget/v1/?ll=${selectedCity.coords[1]}%2C${selectedCity.coords[0]}&z=12&pt=${selectedCity.coords[1]},${selectedCity.coords[0]},pm2rdl`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}
