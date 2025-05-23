import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const ExploreItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [visibleCount, setVisibleCount] = useState(8); 

  function getTimeRemaining(expirationTimestamp) {
    const now = Date.now();
    let diff = expirationTimestamp - now;

    if (diff <= 0) {
      return "Expired";
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff %= 1000 * 60 * 60;

    const minutes = Math.floor(diff / (1000 * 60));
    diff %= 1000 * 60;

    const seconds = Math.floor(diff / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  }

  function ExpiryCountdown({ expiryDate }) {
    const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(expiryDate));

    useEffect(() => {
      const interval = setInterval(() => {
        setTimeRemaining(getTimeRemaining(expiryDate));
      }, 1000);

      return () => clearInterval(interval);
    }, [expiryDate]);

    return <span>{timeRemaining}</span>;
  }

  
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = (filter = "") => {
    setLoading(true);

    let apiUrl = "https://us-central1-nft-cloud-functions.cloudfunctions.net/explore";
    if (filter === "price_low_to_high") {
      apiUrl += "?filter=price_low_to_high";
    } else if (filter === "price_high_to_low") {
      apiUrl += "?filter=price_high_to_low";
    } else if (filter === "likes_high_to_low") {
      apiUrl += "?filter=likes_high_to_low";
    }

    axios
      .get(apiUrl)
      .then((response) => {
        setItems(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching explore items:", error);
        setLoading(false);
      });
  };

  const handleFilterChange = (e) => {
    const selectedFilter = e.target.value;
    setFilter(selectedFilter);
    fetchItems(selectedFilter); 
  };

  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + 4); 
  };

  return (
    <>
      <div>
        <select id="filter-items" value={filter} onChange={handleFilterChange}>
          <option value="">Default</option>
          <option value="price_low_to_high">Price, Low to High</option>
          <option value="price_high_to_low">Price, High to Low</option>
          <option value="likes_high_to_low">Most liked</option>
        </select>
      </div>
      {loading ? (
        <div className="row">
          {new Array(8).fill(0).map((_, index) => (
            <div
              key={index}
              className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12"
              style={{ display: "block", backgroundSize: "cover" }}
            >
              <div className="nft__item skeleton"></div>
            </div>
          ))}
        </div>
      ) : (
        items.slice(0, visibleCount).map((item, index) => (
          <div
            key={index}
            className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12"
            style={{ display: "block", backgroundSize: "cover" }}
          >
            <div className="nft__item">
              <div className="author_list_pp">
                <Link
                  to={`/author/${item.authorId}`}
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title={`Creator: ${item.creator}`}
                >
                  <img className="lazy" src={item.authorImage} alt={item.creator} />
                  <i className="fa fa-check"></i>
                </Link>
              </div>
              <div className="de_countdown">
                <ExpiryCountdown expiryDate={item.expiryDate} />
              </div>

              <div className="nft__item_wrap">
                <div className="nft__item_extra">
                  <div className="nft__item_buttons">
                    <button>Buy Now</button>
                    <div className="nft__item_share">
                      <h4>Share</h4>
                      <a href="" target="_blank" rel="noreferrer">
                        <i className="fa fa-facebook fa-lg"></i>
                      </a>
                      <a href="" target="_blank" rel="noreferrer">
                        <i className="fa fa-twitter fa-lg"></i>
                      </a>
                      <a href="">
                        <i className="fa fa-envelope fa-lg"></i>
                      </a>
                    </div>
                  </div>
                </div>
                <Link to={`/item-details/${item.nftId}`}>
                  <img
                    src={item.nftImage}
                    className="lazy nft__item_preview"
                    alt={item.title}
                  />
                </Link>
              </div>
              <div className="nft__item_info">
                <Link to={`/item-details/${item.nftId}`}>
                  <h4>{item.title}</h4>
                </Link>
                <div className="nft__item_price">{item.price} ETH</div>
                <div className="nft__item_like">
                  <i className="fa fa-heart"></i>
                  <span>{item.likes}</span>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
      {visibleCount < items.length && (
        <div className="col-md-12 text-center">
          <button onClick={handleLoadMore} id="loadmore" className="btn-main lead">
            Load more
          </button>
        </div>
      )}
    </>
  );
};

export default ExploreItems;
