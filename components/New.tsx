import "./New.css";
import React from "react";

interface NewsData {
  author_email: string;
  created_at: string;
  id: number;
  imageurl: string;
  text: string;
  title: string;
  updated_at: string;
  imagepublicid: string;
}

interface NewProps {
  item: NewsData;
  reversed?: boolean;
}

function New({ item, reversed }: NewProps) {
  const formattedDate = new Date(item.updated_at).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="news-card">
      <div className="news-header">
        <span className="news-author">{item.author_email}</span>
        <span className="news-date">{formattedDate}</span>
      </div>
      <h2 className="news-title">{item.title}</h2>
      <div className="news-body">
        {item.imageurl && (
          <img src={item.imageurl} alt="news" className={`news-image ${reversed ? "float-right" : "float-left"}`} />
        )}
        <p className="news-text">{item.text}</p>
      </div>
    </div>
  );
}

export default New;
