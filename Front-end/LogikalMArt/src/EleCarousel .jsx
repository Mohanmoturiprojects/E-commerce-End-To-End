import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './Electronics.css';

const images = [
'/ele1.avif',
 'public/ele4.jpg',
 '/ele.png',
 '/ele5.webp'

 
];

const EleCarousel = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 1200,         // smooth scroll
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1000, // 4 seconds per slide
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

export default EleCarousel;
