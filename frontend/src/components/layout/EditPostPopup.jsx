import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Spinner } from 'react-bootstrap';
import PostService from '../services/PostService';
import { toast } from 'react-toastify';

const EditPostPopup = ({ show, handleClose, postId, onPostUpdated }) => {
  const [post, setPost] = useState({
    title: '',
    content: '',
    tags: []
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (postId && show) {
      setLoading(true);
      PostService.getPostForEdit(postId)
        .then(response => {
          // Format tags from array to comma-separated string for editing
          const postData = response.data;
          setPost({
            ...postData,
            tags: Array.isArray(postData.tags) ? postData.tags.join(', ') : postData.tags
          });
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching post for edit:', error);
          toast.error('Failed to load post details');
          handleClose();
          setLoading(false);
        });
    }
  }, [postId, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPost(prevPost => ({
      ...prevPost,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setUpdating(true);

    // Format tags back to array before sending to API
    const formattedPost = {
      ...post,
      tags: post.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    PostService.updatePost(postId, formattedPost)
      .then(response => {
        toast.success('Post updated successfully');
        onPostUpdated(response.data);
        handleClose();
      })
      .catch(error => {
        console.error('Error updating post:', error);
        toast.error('Failed to update post');
      })
      .finally(() => {
        setUpdating(false);
      });
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Post</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center p-4">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={post.title || ''}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="content"
                value={post.content || ''}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tags (comma separated)</Form.Label>
              <Form.Control
                type="text"
                name="tags"
                value={post.tags || ''}
                onChange={handleChange}
              />
            </Form.Group>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={updating}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit} 
          disabled={loading || updating}
        >
          {updating ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              <span className="ms-2">Updating...</span>
            </>
          ) : 'Update Post'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditPostPopup;