import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './Home.css';

const images = [
  '/home4.jpg',
  '/wom2.webp',
  '/home.jpg',
   '/home3.jpg',
 '/home1.webp',
 '/home2.webp',
];

const HomeCarousel  = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 1200,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1000,
    pauseOnHover: true,
    arrows: false,
    cssEase: 'ease-in-out',
  }

  return (
    <div className="carousel-container">
      <Slider {...settings}>
        {images.map((src, index) => (
          <div className="slide-item" key={index}>
            <img src={src} alt={`slide-${index}`} />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default HomeCarousel;
